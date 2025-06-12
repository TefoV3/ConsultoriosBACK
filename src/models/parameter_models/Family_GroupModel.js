import { Family_Group } from "../../schemas/parameter_tables/Family_Group.js";
import { AuditModel } from "../../models/AuditModel.js";

export class FamilyGroupModel {
    
    static async getAll() {
        try {
            return await Family_Group.findAll({ where: { Family_Group_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Family_Group.findOne({
                where: { Family_Group_ID: id, Family_Group_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Family_Group.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Family_Group",
                            `El usuario interno ${internalId} creó un nuevo registro de Family_Group con ID ${newRecord.Family_Group_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Family_Group.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Family_Group",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registro de Family_Group.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Family Group: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const Family_GroupRecord = await this.getById(id);
            if (!Family_GroupRecord) return null;

            const [rowsUpdated] = await Family_Group.update(data, {
                where: { Family_Group_ID: id, Family_Group_Status: true }
            });

            if (rowsUpdated === 0) return null;
            
                        await AuditModel.registerAudit(
                            internalId,
                            "UPDATE",
                            "Family_Group",
                            `El usuario interno ${internalId} actualizó Family_Group con ID ${id}`
                        );
            
                        return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const Family_GroupRecord = await this.getById(id);
            if (!Family_GroupRecord) return null;

            await Family_Group.update(
                { Family_Group_Status: false },
                { where: { Family_Group_ID: id, Family_Group_Status: true } }
            );
            await AuditModel.registerAudit(
                            internalId,
                            "DELETE",
                            "Family_Group",
                            `El usuario interno ${internalId} eliminó lógicamente Family_Group con ID ${id}`
                        );

            return Family_GroupRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
