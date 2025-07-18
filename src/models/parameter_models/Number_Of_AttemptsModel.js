import { Number_Of_Attempts } from "../../schemas/parameter_tables/Number_Of_Attempts.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class NumberOfAttemptsModel {

    static async getAll() {
        try {
            return await Number_Of_Attempts.findAll({
                where: { Number_Of_Attempts_Status: true },
            });
        } catch (error) {
            throw new Error(`Error retrieving number of attempts: ${error.message}`);
        }
    }

    static async getCurrent() {
        try {
            return await Number_Of_Attempts.findOne({
                where: { Number_Of_Attempts_Status: true },
                order: [['Number_Of_Attempts_ID', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error retrieving current number of attempts: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Number_Of_Attempts.findOne({
                where: { Number_Of_Attempts_ID: id, Number_Of_Attempts_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving number of attempts: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Number_Of_Attempts.create(data);
            
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
                "Number_Of_Attempts",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro Number_Of_Attempts con ID ${newRecord.Number_Of_Attempts_ID}`
            );
            
                return newRecord;
        } catch (error) {
            throw new Error(`Error creating number of attempts: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Number_Of_Attempts.bulkCreate(data);
            
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
                "Number_Of_Attempts",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de Number_Of_Attempts.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Number Of Attempts: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const attemptsRecord = await this.getById(id);
            if (!attemptsRecord) return null;

            const [rowsUpdated] = await Number_Of_Attempts.update(data, {
                where: { Number_Of_Attempts_ID: id, Number_Of_Attempts_Status: true }
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

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Number_Of_Attempts",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó Number_Of_Attempts con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating number of attempts: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const attemptsRecord = await this.getById(id);
            if (!attemptsRecord) return null;

            await Number_Of_Attempts.update(
                { Number_Of_Attempts_Status: false },
                { where: { Number_Of_Attempts_ID: id, Number_Of_Attempts_Status: true } }
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
                "Number_Of_Attempts",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente Number_Of_Attempts con ID ${id}`
            );

            return attemptsRecord;
        } catch (error) {
            throw new Error(`Error deleting number of attempts: ${error.message}`);
        }
    }
}
