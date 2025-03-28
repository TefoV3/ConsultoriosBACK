import { Period_Type } from "../../schemas/parameter_tables/Period_Type.js";

export class PeriodTypeModel {

    static async getAll() {
        try {
            return await Period_Type.findAll({
                where: { Period_Type_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving period types: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Period_Type.findOne({
                where: { Period_Type_ID: id, Period_Type_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving period type: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Period_Type.create(data);
        } catch (error) {
            throw new Error(`Error creating period type: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const periodTypeRecord = await this.getById(id);
            if (!periodTypeRecord) return null;

            const [rowsUpdated] = await Period_Type.update(data, {
                where: { Period_Type_ID: id, Period_Type_Status: true }
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

            await Period_Type.update(
                { Period_Type_Status: false },
                { where: { Period_Type_ID: id, Period_Type_Status: true } }
            );
            return periodTypeRecord;
        } catch (error) {
            throw new Error(`Error deleting period type: ${error.message}`);
        }
    }
}
