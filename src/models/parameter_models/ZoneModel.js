import { Zone } from "../../schemas/parameter_tables/Zone.js";

export class ZoneModel {

    static async getAll() {
        try {
            return await Zone.findAll({ where: { Zone_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving zone: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Zone.findOne({
                where: { Zone_ID: id, Zone_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving zone: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Zone.create(data);
        } catch (error) {
            throw new Error(`Error creating zone: ${error.message}`);
        }
    }

        // EthnicityModel.js
    static async bulkCreate(data) {
        try {
            return await Zone.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Zonas: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const zoneRecord = await this.getById(id);
            if (!zoneRecord) return null;

            const [rowsUpdated] = await Zone.update(data, {
                where: { Zone_ID: id, Zone_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating zone: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const zoneRecord = await this.getById(id);
            if (!zoneRecord) return null;

            await Zone.update(
                { Zone_Status: false },
                { where: { Zone_ID: id, Zone_Status: true } }
            );
            return zoneRecord;
        } catch (error) {
            throw new Error(`Error deleting zone: ${error.message}`);
        }
    }
}
