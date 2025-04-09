import { Sector } from "../../schemas/parameter_tables/Sector.js";
import { Zone } from "../../schemas/parameter_tables/Zone.js"; // Importar Zone

export class SectorModel {

static async getAll() {
    try {
        return await Sector.findAll({
            where: { Sector_Status: true },
            include: {
                model: Zone, // Incluir la información de la zona asociada
                attributes: ["Zone_ID", "Zone_Name"] // Asegúrate de incluir Zone_ID
            }
        });
    } catch (error) {
        throw new Error(`Error retrieving sectors: ${error.message}`);
    }
}

    static async getById(id) {
        try {
            return await Sector.findOne({
                where: { Sector_ID: id, Sector_Status: true },
                include: {
                    model: Zone, // Incluir la información de la zona asociada
                    attributes: ["Zone_Name"]
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving sector: ${error.message}`);
        }
    }

    static async getSectorZone(id) {
        try {
            const sector = await Sector.findOne({
                where: { Sector_ID: id, Sector_Status: true },
            });
            if (!sector) return null;
            const zone = await Zone.findOne({
                where: { Zone_ID: sector.Zone_FK, Zone_Status: true },
            });
            return zone;
        } catch (error) {
            throw new Error(`Error retrieving sector zone: ${error.message}`);
        }
    }





    static async create(data) {
        try {
            return await Sector.create(data);
        } catch (error) {
            throw new Error(`Error creating sector: ${error.message}`);
        }
    }
    
    static async bulkCreate(data) {
        try {
            return await Sector.bulkCreate(data);
        } catch (error) {
            throw new Error(`Error creating sectors: ${error.message}`);
        }
    }
    static async update(id, data) {
        try {
            const sectorRecord = await this.getById(id);
            if (!sectorRecord) return null;

            const [rowsUpdated] = await Sector.update(data, {
                where: { Sector_ID: id, Sector_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating sector: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const sectorRecord = await this.getById(id);
            if (!sectorRecord) return null;

            await Sector.update(
                { Sector_Status: false },
                { where: { Sector_ID: id, Sector_Status: true } }
            );
            return sectorRecord;
        } catch (error) {
            throw new Error(`Error deleting sector: ${error.message}`);
        }
    }
}
