import { PeriodType } from "../../schemas/parameter_tables/PeriodType.js";

export class PeriodTypeModel {

    static async getAll() {
        try {
            return await PeriodType.findAll({
                where: { PeriodType_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving period types: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await PeriodType.findOne({
                where: { PeriodType_ID: id, PeriodType_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving period type: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await PeriodType.create(data);
        } catch (error) {
            throw new Error(`Error creating period type: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const periodTypeRecord = await this.getById(id);
            if (!periodTypeRecord) return null;

            const [rowsUpdated] = await PeriodType.update(data, {
                where: { PeriodType_ID: id, PeriodType_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating period type: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const periodTypeRecord = await this.getById(id);
            if (!periodTypeRecord) return null;

            await PeriodType.update(
                { PeriodType_Status: false },
                { where: { PeriodType_ID: id, PeriodType_Status: true } }
            );
            return periodTypeRecord;
        } catch (error) {
            throw new Error(`Error deleting period type: ${error.message}`);
        }
    }
}
