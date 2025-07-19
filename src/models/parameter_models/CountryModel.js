import { Country } from "../../schemas/parameter_tables/Country.js";
import { AuditModel } from "../../models/AuditModel.js";

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

    static async create(data, internalId) {
        try {
            // Validar que el nombre del país no exista
            const existingCountry = await Country.findOne({
                where: { Country_Name: data.Country_Name, Country_Status: true }
            });
            if (existingCountry) {
                throw new Error(`Country with name "${data.Country_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Country_Status = true; // Aseguramos que el país esté activo al crearlo
            data.Country_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Country.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Country",
                            `El usuario interno ${internalId} creó un nuevo registro de Country con ID ${newRecord.Country_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating country: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Country.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Country",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Country.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Country: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const countryRecord = await this.getById(id);
            if (!countryRecord) return null;

            const [rowsUpdated] = await Country.update(data, {
                where: { Country_ID: id, Country_Status: true }
            });

            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Country",
                `El usuario interno ${internalId} actualizó Country con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating country: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const countryRecord = await this.getById(id);
            if (!countryRecord) return null;

            await Country.update(
                { Country_Status: false },
                { where: { Country_ID: id, Country_Status: true }
            });
            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Country",
                `El usuario interno ${internalId} eliminó lógicamente Country con ID ${id}`
            );
            return countryRecord;
        } catch (error) {
            throw new Error(`Error deleting country: ${error.message}`);
        }
    }
}
