import { Occupations } from "../../schemas/parameter_tables/Occupations.js";
import { AuditModel } from "../../models/AuditModel.js";

export class OccupationsModel {
    
    static async getAll() {
        try {
            return await Occupations.findAll({ where: { Occupation_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Occupations.findOne({
                where: { Occupation_ID: id, Occupation_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Occupations.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Occupations",
                            `El usuario interno ${internalId} creó un nuevo registro de Occupations con ID ${newRecord.Occupation_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Occupations.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Occupations",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Occupations.`
                        );
            
                return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Occupations: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const OccupationsRecord = await this.getById(id);
            if (!OccupationsRecord) return null;

            const [rowsUpdated] = await Occupations.update(data, {
                where: { Occupation_ID: id, Occupation_Status: true }
            });

            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Occupations",
                `El usuario interno ${internalId} actualizó Occupations con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const OccupationsRecord = await this.getById(id);
            if (!OccupationsRecord) return null;

            await Occupations.update(
                { Occupation_Status: false },
                { where: { Occupation_ID: id, Occupation_Status: true } }
            );

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Occupations",
                `El usuario interno ${internalId} eliminó lógicamente Occupations con ID ${id}`
            );

            return OccupationsRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
