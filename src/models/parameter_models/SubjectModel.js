import { Subject } from "../../schemas/parameter_tables/Subject.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class SubjectModel {

    static async getAll() {
        try {
            return await Subject.findAll({ where: { Subject_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving subjects: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Subject.findOne({
                where: { Subject_ID: id, Subject_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving subject: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del subject no exista
            const existingSubject = await Subject.findOne({
                where: { Subject_Name: data.Subject_Name, Subject_Status: true }
            });
            if (existingSubject) {
                throw new Error(`Subject with name "${data.Subject_Name}" already exists.`);
            }
            // Crear el nuevo registro
            const newRecord = await Subject.create(data);
            
            // Auditoría detallada
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

            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "Subject",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de Subject con ID ${newRecord.Subject_ID} - Nombre: ${newRecord.Subject_Name}`
            );
            
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating subject: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Subject.bulkCreate(data);
            
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

            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "Subject",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de Subject.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Subject: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const subjectRecord = await this.getById(id);
            if (!subjectRecord) return null;

            const [rowsUpdated] = await Subject.update(data, {
                where: { Subject_ID: id, Subject_Status: true }
            });

            if (rowsUpdated === 0) return null;
            
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

            // Describir cambios
            let changeDetails = [];
            if (data.hasOwnProperty('Subject_Name') && data.Subject_Name !== originalValues.Subject_Name) {
                changeDetails.push(`Nombre: "${originalValues.Subject_Name}" → "${data.Subject_Name}"`);
            }
            if (data.hasOwnProperty('Subject_Status') && data.Subject_Status !== originalValues.Subject_Status) {
                changeDetails.push(`Estado: "${originalValues.Subject_Status}" → "${data.Subject_Status}"`);
            }
            const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : '';

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Subject",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la Subject con ID ${id} - Nombre: ${subjectRecord.Subject_Name}${changeDescription}`
            );
            
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating subject: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const subjectRecord = await this.getById(id);
            if (!subjectRecord) return null;

            await Subject.update(
                { Subject_Status: false },
                { where: { Subject_ID: id, Subject_Status: true } }
            );

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

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Subject",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente la Subject con ID ${id} - Nombre: ${subjectRecord.Subject_Name}`
            );
            return subjectRecord;
        } catch (error) {
            throw new Error(`Error deleting subject: ${error.message}`);
        }
    }
}
