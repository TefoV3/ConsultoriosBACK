import { Client_Type } from "../../schemas/parameter_tables/Client_Type.js";

export class ClientTypeModel {
    static async getAll() {
        try {
            return await Client_Type.findAll({
                where: { Client_Type_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving client types: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Client_Type.findOne({
                where: { Client_Type_ID: id, Client_Type_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving client type: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Client_Type.create(data);
        } catch (error) {
            throw new Error(`Error creating client type: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Client_Type.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Client Type: ${error.message}`);
        }
    }
    static async update(id, data) {
        try {
            const clientTypeRecord = await this.getById(id);
            if (!clientTypeRecord) return null;

            const [rowsUpdated] = await Client_Type.update(data, {
                where: { Client_Type_ID: id, Client_Type_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating client type: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const clientTypeRecord = await this.getById(id);
            if (!clientTypeRecord) return null;

            await Client_Type.update(
                { Client_Type_Status: false },
                { where: { Client_Type_ID: id, Client_Type_Status: true } }
            );
            return clientTypeRecord;
        } catch (error) {
            throw new Error(`Error deleting client type: ${error.message}`);
        }
    }

}