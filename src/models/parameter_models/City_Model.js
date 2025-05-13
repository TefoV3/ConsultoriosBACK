import { City } from "../../schemas/parameter_tables/City.js";
import { Province } from "../../schemas/parameter_tables/Province.js";

export class CityModel {

    static async getAll() {
        try {
            return await City.findAll({
                where: { City_Status: true },
                include: {
                    model: Province, // Incluir información de Country
                    attributes: ["Province_Name"] // Campos que deseas incluir
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving cities: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await City.findOne({
                where: { City_ID: id, City_Status: true },
                include: {
                    model: Province, // Incluir información de Country
                    attributes: ["Province_Name"] // Campos que deseas incluir
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving city: ${error.message}`);
        }
    }

    static async getByProvinceId(provinceId) {
        try {
            return await City.findAll({
                where: { Province_FK: provinceId, City_Status: true },
            });
        } catch (error) {
            throw new Error(`Error retrieving cities by province ID: ${error.message}`);
        }
    }



    static async create(data) {
        try {
            return await City.create(data);
        } catch (error) {
            throw new Error(`Error creating city: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const cityRecord = await this.getById(id);
            if (!cityRecord) return null;

            const [rowsUpdated] = await City.update(data, {
                where: { City_ID: id, City_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating city: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const cityRecord = await this.getById(id);
            if (!cityRecord) return null;

            await City.update(
                { City_Status: false },
                { where: { City_ID: id, City_Status: true } }
            );
            return cityRecord;
        } catch (error) {
            throw new Error(`Error deleting city: ${error.message}`);
        }
    }
}
