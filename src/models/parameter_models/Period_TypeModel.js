import { Period_Type } from "../../schemas/parameter_tables/Period_Type.js";
import { AuditModel } from "../../models/AuditModel.js";

export class PeriodTypeModel {

    static async getAll() {
        try {
            return await Period_Type.findAll({
                where: { Period_Type_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving period types: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Period_Type.findOne({
                where: { Period_Type_ID: id, Period_Type_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving period type: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Period_Type.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Period_Type",
                            `El usuario interno ${internalId} creó un nuevo registro Period_Type con ID ${newRecord.Period_Type_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating period type: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Period_Type.bulkCreate(data)
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Period_Type",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Period_Type`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Period Type: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const periodTypeRecord = await this.getById(id);
            if (!periodTypeRecord) return null;

            const [rowsUpdated] = await Period_Type.update(data, {
                where: { Period_Type_ID: id, Period_Type_Status: true }
            });

            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Period_Type",
                `El usuario interno ${internalId} actualizó Period_Type con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating period type: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const periodTypeRecord = await this.getById(id);
            if (!periodTypeRecord) return null;

            await Period_Type.update(
                { Period_Type_Status: false },
                { where: { Period_Type_ID: id, Period_Type_Status: true } }
            );

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Period_Type",
                `El usuario interno ${internalId} eliminó lógicamente Period_Type con ID ${id}`
            );
            return periodTypeRecord;
        } catch (error) {
            throw new Error(`Error deleting period type: ${error.message}`);
        }
    }
}
