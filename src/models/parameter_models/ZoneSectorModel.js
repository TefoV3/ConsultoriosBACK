import { Zone_Sector } from "../../schemas/parameter_tables/Zone_Sector.js";

export class ZoneSectorModel {

    static async getAll() {
        try {
            return await Zone_Sector.findAll({ where: { Zone_Sector_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving zone sectors: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Zone_Sector.findOne({
                where: { Zone_Sector_ID: id, Zone_Sector_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving zone sector: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Zone_Sector.create(data);
        } catch (error) {
            throw new Error(`Error creating zone sector: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const zoneSectorRecord = await this.getById(id);
            if (!zoneSectorRecord) return null;

            const [rowsUpdated] = await Zone_Sector.update(data, {
                where: { Zone_Sector_ID: id, Zone_Sector_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating zone sector: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const zoneSectorRecord = await this.getById(id);
            if (!zoneSectorRecord) return null;

            await Zone_Sector.update(
                { Zone_Sector_Status: false },
                { where: { Zone_Sector_ID: id, Zone_Sector_Status: true } }
            );
            return zoneSectorRecord;
        } catch (error) {
            throw new Error(`Error deleting zone sector: ${error.message}`);
        }
    }
}
