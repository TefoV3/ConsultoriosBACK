import { Type_Of_Activity } from "../../schemas/parameter_tables/Type_Of_Activity.js";
import { AuditModel } from "../../models/AuditModel.js";

export class TypeOfActivityModel {
    
    static async getAll() {
        try {
            return await Type_Of_Activity.findAll({ where: { Type_Of_Activity_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Type_Of_Activity.findOne({
                where: { Type_Of_Activity_Id: id, Type_Of_Activity_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Type_Of_Activity.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Type_Of_Activity",
                            `El usuario interno ${internalId} creó un nuevo registro de Type_Of_Activity con ID ${newRecord.Type_Of_Activity_Id}`
                        );
            
                        return newRecord;

        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Type_Of_Activity.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Type_Of_Activity",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Type_Of_Activity.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Case Status: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const typeOfActivityRecord = await this.getById(id);
            if (!typeOfActivityRecord) return null;

            const [rowsUpdated] = await Type_Of_Activity.update(data, {
                where: { Type_Of_Activity_Id: id, Type_Of_Activity_Status: true }
            });

            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Type_Of_Activity",
                `El usuario interno ${internalId} actualizó la Type_Of_Activity con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const typeOfActivityRecord = await this.getById(id);
            if (!typeOfActivityRecord) return null;

            await Type_Of_Activity.update(
                { Type_Of_Activity_Status: false },
                { where: { Type_Of_Activity_Id: id, Type_Of_Activity_Status: true } }
            );

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Type_Of_Activity",
                `El usuario interno ${internalId} eliminó lógicamente la Type_Of_Activity con ID ${id}`
            );

            return typeOfActivityRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
