import { Case_Status } from "../../schemas/parameter_tables/Case_Status.js";

export class CaseStatusModel {
    
    static async getAll() {
        try {
            return await Case_Status.findAll({ where: { Case_Status_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Case_Status.findOne({
                where: { Case_Status_Id: id, Case_Status_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Case_Status.create(data);
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const caseStatusRecord = await this.getById(id);
            if (!caseStatusRecord) return null;

            const [rowsUpdated] = await Case_Status.update(data, {
                where: { Case_Status_Id: id, Case_Status_Status: true }
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

            await Case_Status.update(
                { Case_Status_Status: false },
                { where: { Case_Status_Id: id, Case_Status_Status: true } }
            );
            return caseStatusRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
