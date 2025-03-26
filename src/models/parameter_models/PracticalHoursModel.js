import { Practical_Hours } from "../../schemas/parameter_tables/Practical_Hours.js";

export class PracticalHoursModel {

    static async getAll() {
        try {
            return await Practical_Hours.findAll({
                where: { Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving practical hours: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Practical_Hours.findOne({
                where: { PracticalHours_ID: id, Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving practical hours: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Practical_Hours.create(data);
        } catch (error) {
            throw new Error(`Error creating practical hours: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const hoursRecord = await this.getById(id);
            if (!hoursRecord) return null;

            const [rowsUpdated] = await Practical_Hours.update(data, {
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

            await Practical_Hours.update(
                { Status: false },
                { where: { PracticalHours_ID: id, Status: true } }
            );
            return hoursRecord;
        } catch (error) {
            throw new Error(`Error deleting practical hours: ${error.message}`);
        }
    }
}
