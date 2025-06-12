import { Zone } from "../../schemas/parameter_tables/Zone.js";
import { AuditModel } from "../../models/AuditModel.js";

export class ZoneModel {

    static async getAll() {
        try {
            return await Zone.findAll({ where: { Zone_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving zone: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Zone.findOne({
                where: { Zone_ID: id, Zone_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving zone: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Zone.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Zone",
                            `El usuario interno ${internalId} creó un nuevo registro de Zone con ID ${newRecord.Zone_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating zone: ${error.message}`);
        }
    }

        // EthnicityModel.js
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Zone.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Zone",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Zone.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Zonas: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const zoneRecord = await this.getById(id);
            if (!zoneRecord) return null;

            const [rowsUpdated] = await Zone.update(data, {
                where: { Zone_ID: id, Zone_Status: true }
            });

            if (rowsUpdated === 0) return null;
            
                        await AuditModel.registerAudit(
                            internalId,
                            "UPDATE",
                            "Zone",
                            `El usuario interno ${internalId} actualizó Zone con ID ${id}`
                        );
            
                        return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating zone: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const zoneRecord = await this.getById(id);
            if (!zoneRecord) return null;

            await Zone.update(
                { Zone_Status: false },
                { where: { Zone_ID: id, Zone_Status: true } }
            );

            await AuditModel.registerAudit(
                            internalId,
                            "DELETE",
                            "Zone",
                            `El usuario interno ${internalId} eliminó lógicamente Zone con ID ${id}`
                        );
            return zoneRecord;
        } catch (error) {
            throw new Error(`Error deleting zone: ${error.message}`);
        }
    }
}
