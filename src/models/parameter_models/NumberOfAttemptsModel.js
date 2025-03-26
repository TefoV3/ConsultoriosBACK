import { Number_Of_Attempts } from "../../schemas/parameter_tables/Number_Of_Attempts.js";

export class NumberOfAttemptsModel {

    static async getAll() {
        try {
            return await Number_Of_Attempts.findAll({
                where: { Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving number of attempts: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Number_Of_Attempts.findOne({
                where: { NumberOfAttempts_ID: id, Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving number of attempts: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Number_Of_Attempts.create(data);
        } catch (error) {
            throw new Error(`Error creating number of attempts: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const attemptsRecord = await this.getById(id);
            if (!attemptsRecord) return null;

            const [rowsUpdated] = await Number_Of_Attempts.update(data, {
                where: { NumberOfAttempts_ID: id, Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating number of attempts: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const attemptsRecord = await this.getById(id);
            if (!attemptsRecord) return null;

            await Number_Of_Attempts.update(
                { Status: false },
                { where: { NumberOfAttempts_ID: id, Status: true } }
            );
            return attemptsRecord;
        } catch (error) {
            throw new Error(`Error deleting number of attempts: ${error.message}`);
        }
    }
}
