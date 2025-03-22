import { DocumentationBackupModel } from "../../models/parameter_models/DocumentationBackupModel.js";

export class DocumentationBackupController {

    static async getAll(req, res) {
        try {
            const data = await DocumentationBackupModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await DocumentationBackupModel.getById(id);
            if (!data) return res.status(404).json({ message: "Documentation backup not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const newDocumentationBackup = await DocumentationBackupModel.create(req.body);
            res.status(201).json(newDocumentationBackup);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedDocumentationBackup = await DocumentationBackupModel.update(id, req.body);
            if (!updatedDocumentationBackup) return res.status(404).json({ message: "Documentation backup not found or no changes made" });
            res.status(200).json(updatedDocumentationBackup);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedDocumentationBackup = await DocumentationBackupModel.delete(id);
            if (!deletedDocumentationBackup) return res.status(404).json({ message: "Documentation backup not found" });
            res.status(200).json(deletedDocumentationBackup);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
