import { Schedule } from "../../schemas/parameter_tables/Schedule.js";
import { AuditModel } from "../../models/AuditModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

export class ScheduleModel {

    static async getAll() {
        try {
            return await Schedule.findAll({ where: { Schedule_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving schedules: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Schedule.findOne({
                where: { Schedule_ID: id, Schedule_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving schedule: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Schedule.create(data);
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
                "Schedule",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó un nuevo registro Schedule con ID ${newRecord.Schedule_ID}`
            );
            
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating schedule: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Schedule.bulkCreate(data);
            
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
                "Schedule",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó ${createdRecords.length} registros de Schedule.`
            );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Schedule: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const scheduleRecord = await this.getById(id);
            if (!scheduleRecord) return null;

            const [rowsUpdated] = await Schedule.update(data, {
                where: { Schedule_ID: id, Schedule_Status: true }
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
                "Schedule",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó Schedule con ID ${scheduleRecord.Schedule_ID} - Nombre: ${scheduleRecord.Schedule_Name}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating schedule: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const scheduleRecord = await this.getById(id);
            if (!scheduleRecord) return null;

            await Schedule.update(
                { Schedule_Status: false },
                { where: { Schedule_ID: id, Schedule_Status: true } }
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
                "Schedule",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente Schedule con ID ${id} - Nombre: ${scheduleRecord.Schedule_Name}`
            );
            return scheduleRecord;
        } catch (error) {
            throw new Error(`Error deleting schedule: ${error.message}`);
        }
    }
}

