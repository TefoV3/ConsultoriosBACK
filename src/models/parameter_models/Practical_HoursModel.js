import { Practical_Hours } from "../../schemas/parameter_tables/Practical_Hours.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class PracticalHoursModel {

    static async getAll() {
        try {
            return await Practical_Hours.findAll({
                where: { Practical_Hours_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving practical hours: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Practical_Hours.findOne({
                where: { Practical_Hours_ID: id, Practical_Hours_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving practical hours: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Practical_Hours.create(data);
            
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
                "Practical_Hours",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro de Practical_Hours con ID ${newRecord.Practical_Hours_ID}`
            );
            
            return newRecord;

        } catch (error) {
            throw new Error(`Error creating practical hours: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Practical_Hours.bulkCreate(data);
            
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
                "Practical_Hours",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de Practical_Hours.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Practical Hours: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const hoursRecord = await this.getById(id);
            if (!hoursRecord) return null;

            const [rowsUpdated] = await Practical_Hours.update(data, {
                where: { Practical_Hours_ID: id, Practical_Hours_Status: true }
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
                "Practical_Hours",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó Practical_Hours con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating practical hours: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const hoursRecord = await this.getById(id);
            if (!hoursRecord) return null;

            await Practical_Hours.update(
                { Practical_Hours_Status: false },
                { where: { Practical_Hours_ID: id, Practical_Hours_Status: true } }
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
                "Practical_Hours",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente Practical_Hours con ID ${id}`
            );
            return hoursRecord;
        } catch (error) {
            throw new Error(`Error deleting practical hours: ${error.message}`);
        }
    }
}
