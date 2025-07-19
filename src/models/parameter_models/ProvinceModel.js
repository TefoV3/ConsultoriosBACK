import { Province } from "../../schemas/parameter_tables/Province.js";
import { Country } from "../../schemas/parameter_tables/Country.js"; // Importar City para incluir la relación
import { AuditModel } from "../../models/AuditModel.js";

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

    static async create(data, internalId) {
        try {
            const newRecord = await Province.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Province",
                            `El usuario interno ${internalId} creó un nuevo registro Province con ID ${newRecord.Province_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating province: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Province.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Province",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Province.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Province: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const provinceRecord = await this.getById(id);
            if (!provinceRecord) return null;

            const [rowsUpdated] = await Province.update(data, {
                where: { Province_ID: id, Province_Status: true }
            });

            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Province",
                `El usuario interno ${internalId} actualizó la Province con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating province: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const provinceRecord = await this.getById(id);
            if (!provinceRecord) return null;

            await Province.update(
                { Province_Status: false },
                { where: { Province_ID: id, Province_Status: true } }
            );

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Province",
                `El usuario interno ${internalId} eliminó lógicamente Province con ID ${id}`
            );

            return provinceRecord;
        } catch (error) {
            throw new Error(`Error deleting province: ${error.message}`);
        }
    }
}
