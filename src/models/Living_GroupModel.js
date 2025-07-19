import { LivingGroup } from "../schemas/Living_Group.js";
import { AuditModel } from "./AuditModel.js"; // Para registrar en auditoría
import { getUserId } from '../sessionData.js';

export class LivingGroupModel {
    
    static async getById(id) {
        try {
            return await LivingGroup.findOne({
                where: { LG_LivingGroup_ID: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving living group: ${error.message}`);
        }
    }
    
    static async getByProcessNumber(processNumber) {
        try {
            return await LivingGroup.findAll({
                where: { SW_ProcessNumber: processNumber }
            });
        } catch (error) {
            throw new Error(`Error retrieving living groups by process number: ${error.message}`);
        }
    }

    static async create(data, internalUser) {
        try {
            // Handle empty strings for numeric fields
            if (data.LG_Age === "") data.LG_Age = null;
            
            const internalId = internalUser || getUserId();

            const newRecord = await LivingGroup.create(data);
            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "LivingGroup",
                `El usuario interno ${internalId} creó el registro de grupo de convivencia con ID ${newRecord.LG_LivingGroup_ID}`
            );
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating living group: ${error.message}`);
        }
    }

    static async update(id, data, internalUser) {
        try {
            // First check if the record exists
            const livingGroupRecord = await this.getById(id);
            if (!livingGroupRecord) {
                console.log(`Living group with ID ${id} not found`);
                return null;
            }
            if (!livingGroupRecord) return null;

            const internalId = internalUser || getUserId();

            // Handle empty strings for numeric fields
            if (data.LG_Age === "") data.LG_Age = null;
            
            // Update the record without checking rowsUpdated
            await LivingGroup.update(data, {
                where: { LG_LivingGroup_ID: id }
            });
            
            // Always register the audit regardless of whether the data changed
            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "LivingGroup", // Fixed: was "SocialWork"
                `El usuario interno ${internalId} actualizó el registro de grupo de convivencia con ID ${id}`
            );
            
            // Return the updated record
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating living group: ${error.message}`);
        }
    }
    
    static async delete(id, internalUser) {
        try {
            const record = await this.getById(id);
            if (!record) return null;
                        if (!record) return null;
                        
                        const internalId = internalUser || getUserId();
            
            // Since there's no Status field in the LivingGroup schema, we'll perform a real delete
            await LivingGroup.destroy({ 
                where: { LG_LivingGroup_ID: id } 
            });
            
            // 🔹 Register the deletion in the audit
            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "LivingGroup",
                `El usuario interno ${internalId} eliminó el registro de grupo de convivencia con ID ${id}`
            );
            
            return record;
        } catch (error) {
            throw new Error(`Error deleting living group: ${error.message}`);
        }
    }
}