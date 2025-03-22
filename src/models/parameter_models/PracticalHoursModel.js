import { PracticalHours } from "../../schemas/parameter_tables/PracticalHours.js";

export class PracticalHoursModel {

    static async getAll() {
        try {
            return await PracticalHours.findAll({
                where: { Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving practical hours: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await PracticalHours.findOne({
                where: { PracticalHours_ID: id, Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving practical hours: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await PracticalHours.create(data);
        } catch (error) {
            throw new Error(`Error creating practical hours: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const hoursRecord = await this.getById(id);
            if (!hoursRecord) return null;

            const [rowsUpdated] = await PracticalHours.update(data, {
                where: { PracticalHours_ID: id, Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating practical hours: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const hoursRecord = await this.getById(id);
            if (!hoursRecord) return null;

            await PracticalHours.update(
                { Status: false },
                { where: { PracticalHours_ID: id, Status: true } }
            );
            return hoursRecord;
        } catch (error) {
            throw new Error(`Error deleting practical hours: ${error.message}`);
        }
    }
}
