import { Protocols } from "../../schemas/parameter_tables/Protocols.js";

export class ProtocolsModel {

    static async getAll() {
        try {
            return await Protocols.findAll({ where: { Protocol_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving protocols: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Protocols.findOne({
                where: { Protocol_ID: id, Protocol_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving protocol: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Protocols.create(data);
        } catch (error) {
            throw new Error(`Error creating protocol: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Protocols.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Protocols: ${error.message}`);
        }
    }
    static async update(id, data) {
        try {
            const protocolRecord = await this.getById(id);
            if (!protocolRecord) return null;

            const [rowsUpdated] = await Protocols.update(data, {
                where: { Protocol_ID: id, Protocol_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating protocol: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const protocolRecord = await this.getById(id);
            if (!protocolRecord) return null;

            await Protocols.update(
                { Protocol_Status: false },
                { where: { Protocol_ID: id, Protocol_Status: true } }
            );
            return protocolRecord;
        } catch (error) {
            throw new Error(`Error deleting protocol: ${error.message}`);
        }
    }
}