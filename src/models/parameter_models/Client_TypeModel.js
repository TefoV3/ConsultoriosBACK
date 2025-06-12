import { Client_Type } from "../../schemas/parameter_tables/Client_Type.js";
import { AuditModel } from "../../models/AuditModel.js";

export class ClientTypeModel {
    static async getAll() {
        try {
            return await Client_Type.findAll({
                where: { Client_Type_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving client types: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Client_Type.findOne({
                where: { Client_Type_ID: id, Client_Type_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving client type: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Client_Type.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Client_Type",
                            `El usuario interno ${internalId} creó un nuevo registro de Client Type con ID ${newRecord.Client_Type_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating client type: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Client_Type.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Client_Type",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Client Type.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Client Type: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const clientTypeRecord = await this.getById(id);
            if (!clientTypeRecord) return null;

            const [rowsUpdated] = await Client_Type.update(data, {
                where: { Client_Type_ID: id, Client_Type_Status: true }
            });

            if (rowsUpdated === 0) return null;
            
                        await AuditModel.registerAudit(
                            internalId,
                            "UPDATE",
                            "Client_Type",
                            `El usuario interno ${internalId} actualizó la Client Type con ID ${id}`
                        );
            
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating client type: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const clientTypeRecord = await this.getById(id);
            if (!clientTypeRecord) return null;

            await Client_Type.update(
                { Client_Type_Status: false },
                { where: { Client_Type_ID: id, Client_Type_Status: true } }
            );

            await AuditModel.registerAudit(
                            internalId,
                            "DELETE",
                            "Client_Type",
                            `El usuario interno ${internalId} eliminó lógicamente la Client Type con ID ${id}`
                        );
            return clientTypeRecord;
        } catch (error) {
            throw new Error(`Error deleting client type: ${error.message}`);
        }
    }

}