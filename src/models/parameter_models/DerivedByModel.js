import { DerivedBy } from "../../schemas/parameter_tables/DerivedBy.js";

export class DerivedByModel {

    static async getAll() {
        try {
            return await DerivedBy.findAll({
                where: { DerivedBy_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving derived by records: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await DerivedBy.findOne({
                where: { DerivedBy_ID: id, DerivedBy_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving derived by record: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await DerivedBy.create(data);
        } catch (error) {
            throw new Error(`Error creating derived by record: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const derivedByRecord = await this.getById(id);
            if (!derivedByRecord) return null;

            const [rowsUpdated] = await DerivedBy.update(data, {
                where: { DerivedBy_ID: id, DerivedBy_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating derived by record: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const derivedByRecord = await this.getById(id);
            if (!derivedByRecord) return null;

            await DerivedBy.update(
                { DerivedBy_Status: false },
                { where: { DerivedBy_ID: id, DerivedBy_Status: true } }
            );
            return derivedByRecord;
        } catch (error) {
            throw new Error(`Error deleting derived by record: ${error.message}`);
        }
    }
}
