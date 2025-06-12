import { Complexity } from "../../schemas/parameter_tables/Complexity.js";
import { AuditModel } from "../../models/AuditModel.js";

export class ComplexityModel {

    static async getAll() {
        try {
            return await Complexity.findAll({
                where: { Complexity_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving complexity: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Complexity.findOne({
                where: { Complexity_ID: id, Complexity_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving complexity: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Complexity.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Complexity",
                            `El usuario interno ${internalId} creó un nuevo registro de Complexity con ID ${newRecord.Complexity_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating complexity: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Complexity.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Complexity",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Complexity.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Complexity: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const complexityRecord = await this.getById(id);
            if (!complexityRecord) return null;

            const [rowsUpdated] = await Complexity.update(data, {
                where: { Complexity_ID: id, Complexity_Status: true }
            });

            if (rowsUpdated === 0) return null;
            
                        await AuditModel.registerAudit(
                            internalId,
                            "UPDATE",
                            "Complexity",
                            `El usuario interno ${internalId} actualizó la Complexity con ID ${id}`
                        );
            
                        return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating complexity: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const complexityRecord = await this.getById(id);
            if (!complexityRecord) return null;

            await Complexity.update(
                { Complexity_Status: false },
                { where: { Complexity_ID: id, Complexity_Status: true } }
            );
            await AuditModel.registerAudit(
                            internalId,
                            "DELETE",
                            "Complexity",
                            `El usuario interno ${internalId} eliminó lógicamente la Complexity con ID ${id}`
                        );
            return complexityRecord;
        } catch (error) {
            throw new Error(`Error deleting complexity: ${error.message}`);
        }
    }
}
