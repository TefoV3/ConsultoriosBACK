import { Protocols } from "../../schemas/parameter_tables/Protocols.js";
import { AuditModel } from "../../models/AuditModel.js";

export class ProtocolsModel {

    static async getAll() {
        try {
            return await Protocols.findAll({ where: { Protocol_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving protocols: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Protocols.findOne({
                where: { Protocol_ID: id, Protocol_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving protocol: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Protocols.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Protocols",
                            `El usuario interno ${internalId} creó un nuevo registro de Protocols con ID ${newRecord.Protocol_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating protocol: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Protocols.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Protocols",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros Protocols.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Protocols: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const protocolRecord = await this.getById(id);
            if (!protocolRecord) return null;

            const [rowsUpdated] = await Protocols.update(data, {
                where: { Protocol_ID: id, Protocol_Status: true }
            });

            if (rowsUpdated === 0) return null;
            
                        await AuditModel.registerAudit(
                            internalId,
                            "UPDATE",
                            "Protocols",
                            `El usuario interno ${internalId} actualizó Protocols con ID ${id}`
                        );
            
                        return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating protocol: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const protocolRecord = await this.getById(id);
            if (!protocolRecord) return null;

            await Protocols.update(
                { Protocol_Status: false },
                { where: { Protocol_ID: id, Protocol_Status: true } }
            );

            await AuditModel.registerAudit(
                            internalId,
                            "DELETE",
                            "Protocols",
                            `El usuario interno ${internalId} eliminó lógicamente Protocols con ID ${id}`
                        );

            return protocolRecord;
        } catch (error) {
            throw new Error(`Error deleting protocol: ${error.message}`);
        }
    }
}