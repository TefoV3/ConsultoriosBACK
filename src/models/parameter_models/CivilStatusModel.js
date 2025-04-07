import { Civil_Status } from "../../schemas/parameter_tables/Civil_Status.js";

export class CivilStatusModel {

    static async getAll() {
        try {
            return await Civil_Status.findAll({
                where: { Civil_Status_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving civil statuses: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Civil_Status.findOne({
                where: { Civil_Status_ID: id, Civil_Status_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving civil status: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Civil_Status.create(data);
        } catch (error) {
            throw new Error(`Error creating civil status: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Civil_Status.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Civil Status: ${error.message}`);
        }
    }
    static async update(id, data) {
        try {
            const civilStatusRecord = await this.getById(id);
            if (!civilStatusRecord) return null;

            const [rowsUpdated] = await Civil_Status.update(data, {
                where: { Civil_Status_ID: id, Civil_Status_Status: true }
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

            await Civil_Status.update(
                { Civil_Status_Status: false },
                { where: { Civil_Status_ID: id, Civil_Status_Status: true } }
            );
            return civilStatusRecord;
        } catch (error) {
            throw new Error(`Error deleting civil status: ${error.message}`);
        }
    }
}
