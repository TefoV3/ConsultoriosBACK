import { Documentation_Backup } from "../../schemas/parameter_tables/Documentation_Backup.js";

export class DocumentationBackupModel {

    static async getAll() {
        try {
            return await Documentation_Backup.findAll({
                where: { DocumentationBackup_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving documentation backup: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Documentation_Backup.findOne({
                where: { DocumentationBackup_ID: id, DocumentationBackup_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving documentation backup: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Documentation_Backup.create(data);
        } catch (error) {
            throw new Error(`Error creating documentation backup: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const documentationBackupRecord = await this.getById(id);
            if (!documentationBackupRecord) return null;

            const [rowsUpdated] = await Documentation_Backup.update(data, {
                where: { DocumentationBackup_ID: id, DocumentationBackup_Status: true }
            });

            if (rowsUpdated === 0) return null;
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
                { DocumentationBackup_Status: false },
                { where: { DocumentationBackup_ID: id, DocumentationBackup_Status: true } }
            );
            return documentationBackupRecord;
        } catch (error) {
            throw new Error(`Error deleting documentation backup: ${error.message}`);
        }
    }
}
