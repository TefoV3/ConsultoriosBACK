import { City } from "../../schemas/parameter_tables/City.js";
import { Province } from "../../schemas/parameter_tables/Province.js";
import { AuditModel } from "../../models/AuditModel.js";

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



    static async create(data, internalId) {
        try {
            const newRecord = await City.create(data);
                                await AuditModel.registerAudit(
                                    internalId,
                                    "INSERT",
                                    "City",
                                    `El usuario interno ${internalId} creó un nuevo registro de City con ID ${newRecord.City_ID}`
                                );
                                    return newRecord
        } catch (error) {
            throw new Error(`Error creating city: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const cityRecord = await this.getById(id);
            if (!cityRecord) return null;

            const [rowsUpdated] = await City.update(data, {
                where: { City_ID: id, City_Status: true }
            });

            if (rowsUpdated === 0) return null;
                    await AuditModel.registerAudit(
                        internalId,
                        "UPDATE",
                        "City",
                        `El usuario interno ${internalId} actualizó la City con ID ${id}`
                    );

                    return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating city: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const cityRecord = await this.getById(id);
            if (!cityRecord) return null;

            await City.update(
                { City_Status: false },
                { where: { City_ID: id, City_Status: true } }
            );

            await AuditModel.registerAudit(
                        internalId,
                        "DELETE",
                        "City",
                        `El usuario interno ${internalId} eliminó lógicamente la enfermedad City con ID ${id}`
                    );
            return cityRecord;
        } catch (error) {
            throw new Error(`Error deleting city: ${error.message}`);
        }
    }
}
