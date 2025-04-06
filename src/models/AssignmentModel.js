import { AuditModel } from "../models/AuditModel.js";
import { Assignment } from "../schemas/Assignment.js";
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { InternalUser } from "../schemas/Internal_User.js";
import { getUserId } from '../sessionData.js';

export class AssignmentModel {

    static async getAll() {
        try {
            return await Assignment.findAll();
        } catch (error) {
            throw new Error(`Error retrieving assignments: ${error.message}`);
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

    static async create(data) {
        try {
            const newAssignment = await Assignment.create(data);
            const internalId = getUserId();

            // 🔹 Registrar en Audit que un usuario interno creó una asignación
            await AuditModel.registerAudit(
                internalId, 
                "INSERT",
                "Assignment",
                `El usuario interno ${internalId} creó la asignación con ID ${newAssignment.Assignment_Id}`
            );

            return newAssignment;
        } catch (error) {
            throw new Error(`Error creating assignment: ${error.message}`);
        }
    }
    static async assignCasesEquitably() {
        try {
            // Obtener estudiantes activos agrupados por área
            const studentsByArea = await InternalUser.findAll({
                where: { Internal_Type: "Estudiante" },
                attributes: ["Internal_ID", "Internal_Area"],
            });

            const coordinatorsByArea = await InternalUser.findAll({
                where: { Internal_Type: "Coordinador" },
                attributes: ["Internal_ID", "Internal_Area"],
            });

            const studentsGroupedByArea = studentsByArea.reduce((acc, student) => {
                if (!acc[student.Internal_Area]) acc[student.Internal_Area] = [];
                acc[student.Internal_Area].push(student.Internal_ID);
                return acc;
            }, {});

            const coordinatorsGroupedByArea = coordinatorsByArea.reduce((acc, coordinator) => {
                if (!acc[coordinator.Internal_Area]) acc[coordinator.Internal_Area] = [];
                acc[coordinator.Internal_Area].push(coordinator.Internal_ID);
                return acc;
            }, {});

            // Obtener casos "Nuevo" agrupados por área
            const newCases = await InitialConsultations.findAll({
                where: { Init_Type: "Nuevo" },
                attributes: ["Init_Code", "Init_Subject", "Init_Complexity"],
            });

            const casesGroupedByArea = newCases.reduce((acc, consultation) => {
                const area = consultation.Init_Subject;
                if (!acc[area]) acc[area] = [];
                acc[area].push(consultation);
                return acc;
            }, {});

            // Realizar la asignación
            const assignments = [];
            for (const [area, cases] of Object.entries(casesGroupedByArea)) {
                const students = studentsGroupedByArea[area] || [];
                const coordinators = coordinatorsGroupedByArea[area] || [];
                const totalUsers = students.concat(coordinators);

                if (totalUsers.length === 0) continue; // Si no hay usuarios en el área, saltar

                for (let i = 0; i < cases.length; i++) {
                    const currentUser = totalUsers[i % totalUsers.length];
                    const assignmentData = {
                        Init_Code: cases[i].Init_Code,
                        Assignment_Date: new Date(),
                        Internal_User_ID_Student: students.includes(currentUser) ? currentUser : null,
                        Internal_User_ID: currentUser,
                    };

                    assignments.push(assignmentData);
                }
            }

            // Insertar las asignaciones en la base de datos
            await Assignment.bulkCreate(assignments);

            // Actualizar Init_Type de los casos a "Asignado"
            const assignedCaseIds = assignments.map(a => a.Init_Code);
            await InitialConsultations.update(
                { Init_Type: "Asignado" },
                { where: { Init_Code: assignedCaseIds } }
            );

            return { message: "Asignación realizada con éxito", assignments };
        } catch (error) {
            throw new Error(`Error al asignar casos: ${error.message}`);
        }
    }
    static async update(id, data) {
        try {
            const assignment = await this.getById(id);
            
            if (!assignment) return null;

            const internalId = getUserId();

            const [rowsUpdated] = await Assignment.update(data, {
                where: { Assignment_Id: id }
            });

            if (rowsUpdated === 0) return null;

            const updatedAssignment = await this.getById(id);

            // 🔹 Registrar en Audit que un usuario interno actualizó una asignación
            await AuditModel.registerAudit(
                internalId, 
                "UPDATE",
                "Assignment",
                `El usuario interno ${internalId} actualizó la asignación con ID ${id}`
            );

            return updatedAssignment;
        } catch (error) {
            throw new Error(`Error updating assignment: ${error.message}`);
        }
    }
    static async delete(id) {
        try {
            const assignment = await this.getById(id);
            if (!assignment) return null;

            const internalId = getUserId();
            
            await Assignment.destroy({ where: { Assignment_Id: id } });

            // 🔹 Registrar en Audit que un usuario interno eliminó una asignación
            await AuditModel.registerAudit(
                internalId, 
                "DELETE",
                "Assignment",
                `El usuario interno ${internalId} eliminó la asignación con ID ${id}`
            );

            return assignment;
        } catch (error) {
            throw new Error(`Error deleting assignment: ${error.message}`);
        }
    }
}

