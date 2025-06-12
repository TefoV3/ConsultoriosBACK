import { Documentation_Backup } from "../../schemas/parameter_tables/Documentation_Backup.js";
import { AuditModel } from "../../models/AuditModel.js";

export class DocumentationBackupModel {

    static async getAll() {
        try {
            return await Documentation_Backup.findAll({
                where: { Documentation_Backup_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving documentation backup: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Documentation_Backup.findOne({
                where: { Documentation_Backup_ID: id, Documentation_Backup_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving documentation backup: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Documentation_Backup.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Documentation_Backup",
                            `El usuario interno ${internalId} creó un nuevo registro de instrucción académica con ID ${newRecord.Documentation_Backup_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating documentation backup: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Documentation_Backup.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Documentation_Backup",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Documentation_Backup.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Documentation Backup: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const documentationBackupRecord = await this.getById(id);
            if (!documentationBackupRecord) return null;

            const [rowsUpdated] = await Documentation_Backup.update(data, {
                where: { Documentation_Backup_ID: id, Documentation_Backup_Status: true }
            });

             if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Documentation_Backup",
                `El usuario interno ${internalId} actualizó Documentation_Backup con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating documentation backup: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const documentationBackupRecord = await this.getById(id);
            if (!documentationBackupRecord) return null;

            await Documentation_Backup.update(
                { Documentation_Backup_Status: false },
                { where: { Documentation_Backup_ID: id, Documentation_Backup_Status: true } }
            );

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Documentation_Backup",
                `El usuario interno ${internalId} eliminó lógicamente Documentation_Backup con ID ${id}`
            );
            return documentationBackupRecord;
        } catch (error) {
            throw new Error(`Error deleting documentation backup: ${error.message}`);
        }
    }
}
