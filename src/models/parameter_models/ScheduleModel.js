import { Schedule } from "../../schemas/parameter_tables/Schedule.js";
import { AuditModel } from "../../models/AuditModel.js";

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
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Schedule",
                            `El usuario interno ${internalId} creó un nuevo registro Schedule con ID ${newRecord.Schedule_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating schedule: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Schedule.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Schedule",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Schedule.`
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

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Schedule",
                `El usuario interno ${internalId} actualizó Schedule con ID ${id}`
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

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Schedule",
                `El usuario interno ${internalId} eliminó lógicamente Schedule con ID ${id}`
            );
            return scheduleRecord;
        } catch (error) {
            throw new Error(`Error deleting schedule: ${error.message}`);
        }
    }
}

