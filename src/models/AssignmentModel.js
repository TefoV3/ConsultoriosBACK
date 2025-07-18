import { AuditModel } from "../models/AuditModel.js";
import { Assignment } from "../schemas/Assignment.js";
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { User } from "../schemas/User.js";
import { InternalUser } from "../schemas/Internal_User.js";
import { sequelize } from "../database/database.js"; // Necesario para transacciones
import { Op } from 'sequelize'; // Necesario para operadores como 'in'


export class AssignmentModel {

    static async getAll() {
        try {
            return await Assignment.findAll();
        } catch (error) {
            throw new Error(`Error retrieving assignments: ${error.message}`);
        }
    }

    static async getAllWithDetails() {
        try {
            return await Assignment.findAll({
                include: [
                    {
                        model: InitialConsultations, // Fetches the related InitialConsultation
                        attributes: ['Init_Code', 'Init_Subject', 'User_ID'], // Specify needed attributes
                        required: true, // Optional: Makes it an INNER JOIN
                        include: [
                            {
                                model: User, // Fetches the User related to the InitialConsultation
                                attributes: [
                                    'User_ID',
                                    'User_FirstName',
                                    'User_LastName',
                                ],
                                required: true // Optional: Makes it an INNER JOIN
                            }
                        ]
                    },
                    {
                        model: InternalUser, // Fetches the InternalUser who assigned the case
                        as: 'Assigner', 
                        attributes: ['Internal_ID', 'Internal_Name', 'Internal_LastName'], 
                        required: false 
                    },
                    {
                        model: InternalUser, // Fetches the InternalUser who is the student
                        as: 'Student', 
                        attributes: ['Internal_ID', 'Internal_Name', 'Internal_LastName'], 
                        required: false 
                    }
                ],
                order: [['Assignment_Date', 'DESC']] 
            });
        } catch (error) {
            console.error("Error retrieving assignments with details:", error);
            // Check if the error is specifically about associations or fields
            if (error.message.includes('is not associated') || error.message.includes('Unknown column')) {
                 console.error("Potential issue with Sequelize associations or model attributes. Verify associations in schema files.");
            }
            throw new Error(`Error retrieving assignments with details: ${error.message}`);
        }
    }








    static async getById(id) {
        try {
            return await Assignment.findOne({
                where: { Assignment_Id: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving assignment: ${error.message}`);
        }
    }

    static async getByStudentId(studentId) {
        try {
            return await Assignment.findAll({
                where: { Internal_User_ID_Student: studentId }
            });
        } catch (error) {
            throw new Error(`Error retrieving assignments for student ID ${studentId}: ${error.message}`);
        }
    }

    static async getStudentByInitCode(initCode) {
        try {
            const assignment = await Assignment.findOne({
                where: { Init_Code: initCode },
                attributes: ['Internal_User_ID_Student'],
            });

            if (assignment) {
                return assignment.Internal_User_ID_Student;
            } else {
                return null;
            }
        } catch (error) {
            throw new Error(`Error al buscar el estudiante por código de consulta inicial: ${error.message}`);
        }
    }

    static async getByInitCode(initCode) {
        try {
            return await Assignment.findOne({
                where: { Init_Code: initCode }
            });
        } catch (error) {
            throw new Error(`Error retrieving assignment by Init_Code: ${error.message}`);
        }
    }

    static async create(data, internalUser) {
        try {
            const newAssignment = await Assignment.create(data);
            const internalId = internalUser || getUserId();

                // Obtener información del usuario interno para auditoría
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
                const admin = await InternalUser.findOne({
                    where: { Internal_ID: internalId },
                    attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
                });
                if (admin) {
                    adminInfo = {
                        name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                        role: admin.Internal_Type || 'Rol no especificado',
                        area: admin.Internal_Area || 'Área no especificada'
                    };
                }
            } catch (err) {
                console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            // Registrar auditoría detallada
            await AuditModel.registerAudit(
                internalId, 
                "INSERT",
                "Assignment",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó la asignación con ID ${newAssignment.Assignment_ID} (Caso: ${data.Init_Code}, Estudiante: ${data.Internal_User_ID_Student})`
            );

            return newAssignment;
        } catch (error) {
            throw new Error(`Error creating assignment: ${error.message}`);
        }
    }

    /**
     * Asigna casos pendientes ("Por Asignar") de un área específica
     * de forma equitativa a los estudiantes activos de esa misma área,
     * **considerando la carga de trabajo actual de cada estudiante para nivelar**.
     * @param {string} area - El área (materia) de los casos y estudiantes.
     * @param {string} assignerInternalId - El ID del usuario interno que realiza la asignación.
     * @returns {Promise<object>} - Objeto con mensaje y las asignaciones creadas.
     */
    static async assignPendingCasesByAreaEquitably(area, assignerInternalId) {
        const t = await sequelize.transaction();
        try {
            const loggedInUserId = assignerInternalId;
            if (!loggedInUserId) {
                throw new Error("El ID del usuario asignador es requerido.");
            }

            // 1. Encontrar casos "Por Asignar" del área
            const pendingCases = await InitialConsultations.findAll({
                where: { Init_Type: "Por Asignar", Init_Subject: area },
                attributes: ['Init_Code'],
                transaction: t
            });

            if (!pendingCases || pendingCases.length === 0) {
                await t.rollback();
                return { message: `No hay casos 'Por Asignar' en el área ${area}.`, assignments: [] };
            }
            const caseCodes = pendingCases.map(c => c.Init_Code);
            const numberOfCasesToAssign = caseCodes.length;

            // 2. Encontrar estudiantes activos del área
            const activeStudents = await InternalUser.findAll({
                where: {
                    Internal_Type: "Estudiante",
                    Internal_Status: 'Activo',
                    Internal_Area: area
                },
                attributes: ['Internal_ID'],
                transaction: t
            });

            if (!activeStudents || activeStudents.length === 0) {
                await t.rollback();
                const error = new Error(`No se encontraron estudiantes activos en el área ${area} para asignar los casos.`);
                error.statusCode = 404;
                throw error;
            }
            const studentIds = activeStudents.map(s => s.Internal_ID);

            // 3. Contar asignaciones actuales por estudiante activo de esa área
            const currentAssignmentsCount = await Assignment.findAll({
                attributes: [
                    'Internal_User_ID_Student',
                    [sequelize.fn('COUNT', sequelize.col('Assignment_Id')), 'count']
                ],
                where: {
                    Internal_User_ID_Student: {
                        [Op.in]: studentIds
                    }
                    // Podrías añadir filtros adicionales si solo cuentan ciertos tipos de asignaciones (ej. activas)
                },
                group: ['Internal_User_ID_Student'],
                raw: true, // Devuelve objetos planos
                transaction: t
            });

            // Crear un mapa para fácil acceso a las cuentas: { studentId: count }
            const studentCountsMap = new Map(studentIds.map(id => [id, 0])); // Inicializar todos con 0
            currentAssignmentsCount.forEach(item => {
                studentCountsMap.set(item.Internal_User_ID_Student, parseInt(item.count, 10));
            });

            // Convertir a un array de objetos para poder ordenar: [{ studentId: 'id1', count: 5 }, ...]
            let studentData = studentIds.map(id => ({
                studentId: id,
                count: studentCountsMap.get(id)
            }));

            // 4. Lógica de asignación priorizando a los que tienen menos
            const assignmentsToCreate = [];
            const assignmentDate = new Date();

            for (let i = 0; i < numberOfCasesToAssign; i++) {
                // Ordenar a los estudiantes por su cuenta actual (ascendente) ANTES de cada asignación
                studentData.sort((a, b) => a.count - b.count);

                // El estudiante al que se le asignará es el primero en la lista ordenada (el que tiene menos)
                const targetStudent = studentData[0];

                assignmentsToCreate.push({
                    Init_Code: caseCodes[i],
                    Internal_User_ID_Student: targetStudent.studentId,
                    Assignment_Date: assignmentDate,
                    Internal_User_ID: loggedInUserId
                });

                // Incrementar la cuenta del estudiante que acaba de recibir el caso (en nuestra estructura en memoria)
                targetStudent.count++;
            }

            // 5. Crear las asignaciones en la BD
            const createdAssignments = await Assignment.bulkCreate(assignmentsToCreate, { transaction: t });

            // 6. Actualizar el estado de los casos a "Asignado"
            await InitialConsultations.update(
                { Init_Type: "Asignado" },
                {
                    where: { Init_Code: { [Op.in]: caseCodes } },
                    transaction: t
                }
            );

            // 7. Registrar Auditoría
            // Obtener información del usuario interno para auditoría
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
                const admin = await InternalUser.findOne({
                    where: { Internal_ID: loggedInUserId },
                    attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"],
                    transaction: t
                });
                if (admin) {
                    adminInfo = {
                        name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                        role: admin.Internal_Type || 'Rol no especificado',
                        area: admin.Internal_Area || 'Área no especificada'
                    };
                }
            } catch (err) {
                console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

        // Registrar auditoría detallada
        await AuditModel.registerAudit(
            loggedInUserId,
            "BULK_ASSIGN_EQU",
            "Assignment/InitialConsultations",
            `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) asignó ${caseCodes.length} casos del área ${area} equitativamente (nivelando carga).`,
            { transaction: t }
        );

            // 8. Confirmar la transacción
            await t.commit();

            return {
                message: `Se asignaron ${createdAssignments.length} casos del área ${area} exitosamente, nivelando la carga existente.`,
                assignments: createdAssignments
            };

        } catch (error) {
            await t.rollback();
            console.error("Error en la asignación equitativa (nivelada) de casos:", error);
            throw error; // Re-lanzar para que el controlador lo maneje
        }
    }

    static async update(id, data, internalUser) {
        try {
            const assignment = await this.getById(id);
            
            if (!assignment) return null;

            const internalId = internalUser || getUserId();

            const [rowsUpdated] = await Assignment.update(data, {
                where: { Assignment_Id: id }
            });

            if (rowsUpdated === 0) return null;

            const updatedAssignment = await this.getById(id);

            // Obtener información del usuario interno para auditoría
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
                const admin = await InternalUser.findOne({
                    where: { Internal_ID: internalId },
                    attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
                });
                if (admin) {
                    adminInfo = {
                        name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                        role: admin.Internal_Type || 'Rol no especificado',
                        area: admin.Internal_Area || 'Área no especificada'
                    };
                }
            } catch (err) {
                console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            // Describir cambios relevantes
            let changeDetails = [];
            for (const key in data) {
                if (data.hasOwnProperty(key) && data[key] !== originalValues[key]) {
                    changeDetails.push(`${key}: "${originalValues[key] ?? ''}" → "${data[key] ?? ''}"`);
                }
            }
            const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : '';

            await AuditModel.registerAudit(
                internalId, 
                "UPDATE",
                "Assignment",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la asignación con ID ${id}${changeDescription}`
            );

            return updatedAssignment;
        } catch (error) {
            throw new Error(`Error updating assignment: ${error.message}`);
        }
    }

    /**
     * Actualiza una asignación buscando por Init_Code.
     * @param {string} initCode - El código de la consulta inicial (caso) que viene como parámetro.
     * @param {object} data - Los datos a actualizar en la asignación (del body de la request).
     * @param {string} internalUserId - El ID del usuario interno que realiza la acción (del header).
     * @returns {Promise<Assignment|null>} - La asignación actualizada o null si no se encuentra o no se actualiza.
     */
    static async updateByInitCode(initCode, data, internalUserId) {
        try {
            // 1. Buscar la asignación existente usando el nombre de la clase
            const assignment = await AssignmentModel.getByInitCode(initCode); // <--- CORRECCIÓN AQUÍ

            // 2. Si no se encuentra, retornar null
            if (!assignment) {
                console.log(`Asignación con Init_Code ${initCode} no encontrada.`);
                return null;
            }

            // 3. Obtener el ID del usuario para auditoría (viene del controlador)
            const internalId = internalUserId;
            if (!internalId) {
                 console.warn(`Advertencia: No se pudo obtener el ID del usuario interno para la auditoría (updateByInitCode ${initCode}).`);
                 // Considera lanzar un error si la auditoría es estrictamente necesaria
                 // throw new Error("El ID del usuario interno es requerido para la auditoría.");
            }

            // 4. Realizar la actualización usando Init_Code en el 'where'
            const [rowsUpdated] = await Assignment.update(data, {
                where: { Init_Code: initCode }
            });

            // 5. Si no se actualizó nada (quizás los datos eran iguales), retornar null
            if (rowsUpdated === 0) {
                console.log(`No se realizaron cambios en la asignación con Init_Code ${initCode}.`);
                return null; // Sigue el patrón del ejemplo original
            }

            // 6. Obtener la asignación actualizada para devolverla usando el nombre de la clase
            const updatedAssignment = await AssignmentModel.getByInitCode(initCode); // <--- CORRECCIÓN AQUÍ

            // 7. Registrar en auditoría si tenemos el ID del usuario
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
                const admin = await InternalUser.findOne({
                    where: { Internal_ID: internalId },
                    attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
                });
                if (admin) {
                    adminInfo = {
                        name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                        role: admin.Internal_Type || 'Rol no especificado',
                        area: admin.Internal_Area || 'Área no especificada'
                    };
                }
            } catch (err) {
                console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            // Describir cambios relevantes
            let changeDetails = [];
            for (const key in data) {
                if (data.hasOwnProperty(key) && data[key] !== originalValues[key]) {
                    changeDetails.push(`${key}: "${originalValues[key] ?? ''}" → "${data[key] ?? ''}"`);
                }
            }
            const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : '';

            if (internalId) {
                await AuditModel.registerAudit(
                    internalId,
                    "UPDATE",
                    "Assignment",
                    `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la asignación asociada al caso ${initCode} (ID Asignación: ${assignment.Assignment_ID})${changeDescription}`
                );
            }

            // 8. Devolver la asignación actualizada
            return updatedAssignment;

        } catch (error) {
            // Capturar y relanzar el error para manejo en el controlador
            console.error(`Error updating assignment by Init_Code ${initCode}:`, error);
            // La línea 295 original estaba aquí, relanzando el error
            throw new Error(`Error updating assignment by Init_Code: ${error.message}`);
        }
    }

    static async delete(id, internalUser) {
        try {
            const assignment = await this.getById(id);
            if (!assignment) return null;

            const internalId = internalUser || getUserId();
            
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
                const admin = await InternalUser.findOne({
                    where: { Internal_ID: internalId },
                    attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
                });
                if (admin) {
                    adminInfo = {
                        name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                        role: admin.Internal_Type || 'Rol no especificado',
                        area: admin.Internal_Area || 'Área no especificada'
                    };
                }
            } catch (err) {
                console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            await Assignment.destroy({ where: { Assignment_Id: id } });

            await AuditModel.registerAudit(
                internalId, 
                "DELETE",
                "Assignment",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó la asignación con ID ${id} (Caso: ${assignment.Init_Code}, Estudiante: ${assignment.Internal_User_ID_Student})`
            );

            return assignment;
        } catch (error) {
            throw new Error(`Error deleting assignment: ${error.message}`);
        }
    }
}

