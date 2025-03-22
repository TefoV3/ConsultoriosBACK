import { CivilStatus } from "../../schemas/parameter_tables/CivilStatus.js";

export class CivilStatusModel {

    static async getAll() {
        try {
            return await CivilStatus.findAll({
                where: { CivilStatus_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving civil statuses: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await CivilStatus.findOne({
                where: { CivilStatus_ID: id, CivilStatus_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving civil status: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await CivilStatus.create(data);
        } catch (error) {
            throw new Error(`Error creating civil status: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const civilStatusRecord = await this.getById(id);
            if (!civilStatusRecord) return null;

            const [rowsUpdated] = await CivilStatus.update(data, {
                where: { CivilStatus_ID: id, CivilStatus_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating civil status: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const civilStatusRecord = await this.getById(id);
            if (!civilStatusRecord) return null;

            await CivilStatus.update(
                { CivilStatus_Status: false },
                { where: { CivilStatus_ID: id, CivilStatus_Status: true } }
            );
            return civilStatusRecord;
        } catch (error) {
            throw new Error(`Error deleting civil status: ${error.message}`);
        }
    }
}
