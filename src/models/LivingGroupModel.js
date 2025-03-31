import { LivingGroup } from "../schemas/LivingGroup.js";
import { AuditModel } from "./AuditModel.js"; // Para registrar en auditoría
import { getUserId } from '../sessionData.js';

export class LivingGroupModel {
    
    static async getById(id) {
        try {
            return await LivingGroup.findOne({
                where: { LG_LivingGroup_ID: id, Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving living group: ${error.message}`);
        }
    }

    static async getByProcessNumber(processNumber) {
        try {
            return await LivingGroup.findAll({
                where: { LG_LivingGroup_ID: processNumber, Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving living groups by process number: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            const userId = getUserId();

            const newRecord = await LivingGroup.create(data);
            await AuditModel.registerAudit(
                userId,
                "INSERT",
                "LivingGroup",
                `El usuario interno ${userId} creó el registro de grupo de convivencia con ID ${newRecord.LG_LivingGroup_ID}`
            );
            return newRecord;
        } catch (error) {
            throw new Error(`Error creating living group: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const livingGroupRecord = await this.getById(id);
            if (!livingGroupRecord) return null;

            const [rowsUpdated] = await LivingGroup.update(data, {
                where: { LG_LivingGroup_ID: id, Status: true }
            });

            if (rowsUpdated === 0) return null;
            
            // 🔹 Registrar en auditoría la actualización
            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "SocialWork",
                `El usuario interno ${internalId} actualizó el registro de grupo de convivencia con ID ${id}`
            );
            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating living group: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const record = await this.getById(id);
                        if (!record) return null;
            
                        await SocialWork.update({ LG_Status: false }, { where: { LG_LivingGroup_ID: id } });
            
                        // 🔹 Registrar en auditoría la eliminación (borrado lógico)
                        await AuditModel.registerAudit(
                            internalId,
                            "DELETE",
                            "SocialWork",
                            `El usuario interno ${internalId} eliminó lógicamente el registro de grupo de convivencia con ID ${id}`
                        );
            
                        return record;
        } catch (error) {
            throw new Error(`Error deleting living group: ${error.message}`);
        }
    }
}