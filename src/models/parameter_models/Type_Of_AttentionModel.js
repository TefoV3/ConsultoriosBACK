import { Type_Of_Attention } from "../../schemas/parameter_tables/Type_Of_Attention.js";
import { AuditModel } from "../../models/AuditModel.js";

export class TypeOfAttentionModel {

    static async getAll() {
        try {
            return await Type_Of_Attention.findAll({ where: { Type_Of_Attention_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving type of attentions: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Type_Of_Attention.findOne({
                where: { Type_Of_Attention_ID: id, Type_Of_Attention_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving type of attention: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Type_Of_Attention.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Type_Of_Attention",
                            `El usuario interno ${internalId} creó un nuevo registro de Type_Of_Attention con ID ${newRecord.Type_Of_Attention_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating type of attention: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Type_Of_Attention.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Type_Of_Attention",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Type_Of_Attention.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Type Of Attention: ${error.message}`);
        }
    }   
    static async update(id, data, internalId) {
        try {
            const typeOfAttentionRecord = await this.getById(id);
            if (!typeOfAttentionRecord) return null;

            const [rowsUpdated] = await Type_Of_Attention.update(data, {
                where: { Type_Of_Attention_ID: id, Type_Of_Attention_Status: true }
            });

             if (rowsUpdated === 0) return null;
            
                        await AuditModel.registerAudit(
                            internalId,
                            "UPDATE",
                            "Type_Of_Attention",
                            `El usuario interno ${internalId} actualizó la Type_Of_Attention con ID ${id}`
                        );
            
                        return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating type of attention: ${error.message}`);
        }
    }

    static async delete(id,internalId) {
        try {
            const typeOfAttentionRecord = await this.getById(id);
            if (!typeOfAttentionRecord) return null;

            await Type_Of_Attention.update(
                { Type_Of_Attention_Status: false },
                { where: { Type_Of_Attention_ID: id, Type_Of_Attention_Status: true } }
            );

            await AuditModel.registerAudit(
                            internalId,
                            "DELETE",
                            "Type_Of_Attention",
                            `El usuario interno ${internalId} eliminó lógicamente Type_Of_Attention con ID ${id}`
                        );
            return typeOfAttentionRecord;
        } catch (error) {
            throw new Error(`Error deleting type of attention: ${error.message}`);
        }
    }
}