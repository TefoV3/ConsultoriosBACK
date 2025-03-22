import { Complexity } from "../../schemas/parameter_tables/Complexity.js";

export class ComplexityModel {

    static async getAll() {
        try {
            return await Complexity.findAll({
                where: { Complexity_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving complexity: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Complexity.findOne({
                where: { Complexity_ID: id, Complexity_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving complexity: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Complexity.create(data);
        } catch (error) {
            throw new Error(`Error creating complexity: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const complexityRecord = await this.getById(id);
            if (!complexityRecord) return null;

            const [rowsUpdated] = await Complexity.update(data, {
                where: { Complexity_ID: id, Complexity_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating complexity: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const complexityRecord = await this.getById(id);
            if (!complexityRecord) return null;

            await Complexity.update(
                { Complexity_Status: false },
                { where: { Complexity_ID: id, Complexity_Status: true } }
            );
            return complexityRecord;
        } catch (error) {
            throw new Error(`Error deleting complexity: ${error.message}`);
        }
    }
}
