import { DocumentationBackup } from "../../schemas/parameter_tables/DocumentationBackup.js";

export class DocumentationBackupModel {

    static async getAll() {
        try {
            return await DocumentationBackup.findAll({
                where: { DocumentationBackup_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving documentation backup: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await DocumentationBackup.findOne({
                where: { DocumentationBackup_ID: id, DocumentationBackup_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving documentation backup: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await DocumentationBackup.create(data);
        } catch (error) {
            throw new Error(`Error creating documentation backup: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const documentationBackupRecord = await this.getById(id);
            if (!documentationBackupRecord) return null;

            const [rowsUpdated] = await DocumentationBackup.update(data, {
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

            await DocumentationBackup.update(
                { DocumentationBackup_Status: false },
                { where: { DocumentationBackup_ID: id, DocumentationBackup_Status: true } }
            );
            return documentationBackupRecord;
        } catch (error) {
            throw new Error(`Error deleting documentation backup: ${error.message}`);
        }
    }
}
