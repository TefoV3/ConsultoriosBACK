import { Schedule } from "../../schemas/parameter_tables/Schedule.js";

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
                where: { Schedule_Id: id, Schedule_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving schedule: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Schedule.create(data);
        } catch (error) {
            throw new Error(`Error creating schedule: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const scheduleRecord = await this.getById(id);
            if (!scheduleRecord) return null;

            const [rowsUpdated] = await Schedule.update(data, {
                where: { Schedule_Id: id, Schedule_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating schedule: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const scheduleRecord = await this.getById(id);
            if (!scheduleRecord) return null;

            await Schedule.update(
                { Schedule_Status: false },
                { where: { Schedule_Id: id, Schedule_Status: true } }
            );
            return scheduleRecord;
        } catch (error) {
            throw new Error(`Error deleting schedule: ${error.message}`);
        }
    }
}

