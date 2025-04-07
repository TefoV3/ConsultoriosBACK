import { Country } from "../../schemas/parameter_tables/Country.js";

export class CountryModel {

    static async getAll() {
        try {
            return await Country.findAll({ where: { Country_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving countries: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Country.findOne({
                where: { Country_ID: id, Country_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving country: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Country.create(data);
        } catch (error) {
            throw new Error(`Error creating country: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Country.bulkCreate(data); // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Country: ${error.message}`);
        }
    }
    static async update(id, data) {
        try {
            const countryRecord = await this.getById(id);
            if (!countryRecord) return null;

            const [rowsUpdated] = await Country.update(data, {
                where: { Country_ID: id, Country_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating country: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const countryRecord = await this.getById(id);
            if (!countryRecord) return null;

            await Country.update(
                { Country_Status: false },
                { where: { Country_ID: id, Country_Status: true }
            });
            return countryRecord;
        } catch (error) {
            throw new Error(`Error deleting country: ${error.message}`);
        }
    }
}
