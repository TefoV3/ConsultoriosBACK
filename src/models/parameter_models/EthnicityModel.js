import { Ethnicity } from "../../schemas/parameter_tables/Ethnicity.js";
import { AuditModel } from "../../models/AuditModel.js";

export class EthnicityModel {

    static async getAll() {
        try {
            return await Ethnicity.findAll({
                where: { Ethnicity_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving ethnicities: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Ethnicity.findOne({
                where: { Ethnicity_ID: id, Ethnicity_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving ethnicity: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre de la etnia no exista
            const existingEthnicity = await Ethnicity.findOne({
                where: { Ethnicity_Name: data.Ethnicity_Name, Ethnicity_Status: true }
            });
            if (existingEthnicity) {
                throw new Error(`Ethnicity with name "${data.Ethnicity_Name}" already exists.`);
            }



            const newRecord = await Ethnicity.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Ethnicity",
                            `El usuario interno ${internalId} creó un nuevo registro de Ethnicity con ID ${newRecord.Ethnicity_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating ethnicity: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Ethnicity.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Ethnicity",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Ethnicity.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating ethnicities: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const ethnicityRecord = await this.getById(id);
            if (!ethnicityRecord) return null;

            const [rowsUpdated] = await Ethnicity.update(data, {
                where: { Ethnicity_ID: id, Ethnicity_Status: true }
            });

             if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Ethnicity",
                `El usuario interno ${internalId} actualizó Ethnicity con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating ethnicity: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const ethnicityRecord = await this.getById(id);
            if (!ethnicityRecord) return null;

            await Ethnicity.update(
                { Ethnicity_Status: false },
                { where: { Ethnicity_ID: id, Ethnicity_Status: true } }
            );
            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Academic_Instruction",
                `El usuario interno ${internalId} eliminó lógicamente Ethnicity con ID ${id}`
            );
            return ethnicityRecord;
        } catch (error) {
            throw new Error(`Error deleting ethnicity: ${error.message}`);
        }
    }
}
