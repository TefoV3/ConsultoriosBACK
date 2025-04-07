import { Province } from "../../schemas/parameter_tables/Province.js";
import { Country } from "../../schemas/parameter_tables/Country.js"; // Importar City para incluir la relación

export class ProvinceModel {

    static async getAll() {
        try {
            return await Province.findAll({
                where: { Province_Status: true },
                include: {
                    model: Country, // Incluir la información de la ciudad asociada
                    attributes: ["Country_Name"]
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving provinces: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Province.findOne({
                where: { Province_ID: id, Province_Status: true },
                include: {
                    model: Country, // Incluir la información de la ciudad asociada
                    attributes: ["Country_Name"]
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving province: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Province.create(data);
        } catch (error) {
            throw new Error(`Error creating province: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Province.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Province: ${error.message}`);
        }
    }
    static async update(id, data) {
        try {
            const provinceRecord = await this.getById(id);
            if (!provinceRecord) return null;

            const [rowsUpdated] = await Province.update(data, {
                where: { Province_ID: id, Province_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating province: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const provinceRecord = await this.getById(id);
            if (!provinceRecord) return null;

            await Province.update(
                { Province_Status: false },
                { where: { Province_ID: id, Province_Status: true } }
            );
            return provinceRecord;
        } catch (error) {
            throw new Error(`Error deleting province: ${error.message}`);
        }
    }
}
