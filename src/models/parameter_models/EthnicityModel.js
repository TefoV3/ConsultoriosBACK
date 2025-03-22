import { Ethnicity } from "../../schemas/parameter_tables/Ethnicity.js";

export class EthnicityModel {

    static async getAll() {
        try {
            return await Ethnicity.findAll({
                where: { Ethnicity_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving ethnicities: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Ethnicity.findOne({
                where: { Ethnicity_ID: id, Ethnicity_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving ethnicity: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Ethnicity.create(data);
        } catch (error) {
            throw new Error(`Error creating ethnicity: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const ethnicityRecord = await this.getById(id);
            if (!ethnicityRecord) return null;

            const [rowsUpdated] = await Ethnicity.update(data, {
                where: { Ethnicity_ID: id, Ethnicity_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating ethnicity: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const ethnicityRecord = await this.getById(id);
            if (!ethnicityRecord) return null;

            await Ethnicity.update(
                { Ethnicity_Status: false },
                { where: { Ethnicity_ID: id, Ethnicity_Status: true } }
            );
            return ethnicityRecord;
        } catch (error) {
            throw new Error(`Error deleting ethnicity: ${error.message}`);
        }
    }
}
