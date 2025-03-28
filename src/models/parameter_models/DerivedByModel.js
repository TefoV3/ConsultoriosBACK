import { Derived_By } from "../../schemas/parameter_tables/Derived_By.js";

export class DerivedByModel {

    static async getAll() {
        try {
            return await Derived_By.findAll({
                where: { Derived_By_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving derived by records: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Derived_By.findOne({
                where: { Derived_By_ID: id, Derived_By_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving derived by record: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Derived_By.create(data);
        } catch (error) {
            throw new Error(`Error creating derived by record: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const derivedByRecord = await this.getById(id);
            if (!derivedByRecord) return null;

            const [rowsUpdated] = await Derived_By.update(data, {
                where: { Derived_By_ID: id, Derived_By_Status: true }
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

            await Derived_By.update(
                { Derived_By_Status: false },
                { where: { Derived_By_ID: id, Derived_By_Status: true } }
            );
            return derivedByRecord;
        } catch (error) {
            throw new Error(`Error deleting derived by record: ${error.message}`);
        }
    }
}
