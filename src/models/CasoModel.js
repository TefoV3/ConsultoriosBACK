import { Case } from "../schemas/Caso.js";

export class CaseModel {

    static async getAll() {
        try {
            return await Case.findAll({ where: { Case_IsDeleted: false } });
        } catch (error) {
            throw new Error(`Error retrieving cases: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Case.findOne({
                where: { Case_Code: id, Case_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error retrieving case: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Case.create(data);
        } catch (error) {
            throw new Error(`Error creating case: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const caseRecord = await this.getById(id);
            if (!caseRecord) return null;

            const [rowsUpdated] = await Case.update(data, {
                where: { Case_Code: id, Case_IsDeleted: false }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const caseRecord = await this.getById(id);
            if (!caseRecord) return null;

            await Case.update(
                { Case_IsDeleted: true },
                { where: { Case_Code: id, Case_IsDeleted: false } }
            );
            return caseRecord;
        } catch (error) {
            throw new Error(`Error deleting case: ${error.message}`);
        }
    }
}
