import { Sex } from "../../schemas/parameter_tables/Sex.js";

export class SexModel {

    static async getAll() {
        try {
            return await Sex.findAll({
                where: { Sex_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving sexes: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Sex.findOne({
                where: { Sex_ID: id, Sex_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving sex: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Sex.create(data);
        } catch (error) {
            throw new Error(`Error creating sex: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Sex.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Sex: ${error.message}`);
        }
    }
    static async update(id, data) {
        try {
            const sexRecord = await this.getById(id);
            if (!sexRecord) return null;

            const [rowsUpdated] = await Sex.update(data, {
                where: { Sex_ID: id, Sex_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating sex: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const sexRecord = await this.getById(id);
            if (!sexRecord) return null;

            await Sex.update(
                { Sex_Status: false },
                { where: { Sex_ID: id, Sex_Status: true } }
            );
            return sexRecord;
        } catch (error) {
            throw new Error(`Error deleting sex: ${error.message}`);
        }
    }
}
