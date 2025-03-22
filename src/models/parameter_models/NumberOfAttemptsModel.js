import { NumberOfAttempts } from "../../schemas/parameter_tables/NumberOfAttempts.js";

export class NumberOfAttemptsModel {

    static async getAll() {
        try {
            return await NumberOfAttempts.findAll({
                where: { Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving number of attempts: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await NumberOfAttempts.findOne({
                where: { NumberOfAttempts_ID: id, Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving number of attempts: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await NumberOfAttempts.create(data);
        } catch (error) {
            throw new Error(`Error creating number of attempts: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const attemptsRecord = await this.getById(id);
            if (!attemptsRecord) return null;

            const [rowsUpdated] = await NumberOfAttempts.update(data, {
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

            await NumberOfAttempts.update(
                { Status: false },
                { where: { NumberOfAttempts_ID: id, Status: true } }
            );
            return attemptsRecord;
        } catch (error) {
            throw new Error(`Error deleting number of attempts: ${error.message}`);
        }
    }
}
