import { Pensioner } from "../../schemas/parameter_tables/Pensioner.js";

export class PensionerModel {

    static async getAll() {
        try {
            return await Pensioner.findAll({ where: { Pensioner_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving disabilities: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Pensioner.findOne({
                where: { Pensioner_Id: id, Pensioner_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving Pensioner: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Pensioner.create(data);
        } catch (error) {
            throw new Error(`Error creating Pensioner: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Pensioner.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Pensioner: ${error.message}`);
        }
    }
    static async update(id, data) {
        try {
            const PensionerRecord = await this.getById(id);
            if (!PensionerRecord) return null;

            const [rowsUpdated] = await Pensioner.update(data, {
                where: { Pensioner_Id: id, Pensioner_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating Pensioner: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const PensionerRecord = await this.getById(id);
            if (!PensionerRecord) return null;

            await Pensioner.update(
                { Pensioner_Status: false },
                { where: { Pensioner_Id: id, Pensioner_Status: true } }
            );
            return PensionerRecord;
        } catch (error) {
            throw new Error(`Error deleting Pensioner: ${error.message}`);
        }
    }

}