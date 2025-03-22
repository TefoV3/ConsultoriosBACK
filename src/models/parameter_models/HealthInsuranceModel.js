import { Health_Insurance } from "../../schemas/parameter_tables/Health_Insurance.js";

export class HealthInsuranceModel {
    
    static async getAll() {
        try {
            return await Health_Insurance.findAll({ where: { Health_Insurance_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Health_Insurance.findOne({
                where: { Health_Insurance_Id: id, Health_Insurance_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Health_Insurance.create(data);
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const caseStatusRecord = await this.getById(id);
            if (!caseStatusRecord) return null;

            const [rowsUpdated] = await Health_Insurance.update(data, {
                where: { Health_Insurance_Id: id, Health_Insurance_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const caseStatusRecord = await this.getById(id);
            if (!caseStatusRecord) return null;

            await Health_Insurance.update(
                { Health_Insurance_Status: false },
                { where: { Health_Insurance_Id: id, Health_Insurance_Status: true } }
            );
            return caseStatusRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
