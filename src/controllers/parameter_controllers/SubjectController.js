import { SubjectModel } from "../../models/parameter_models/SubjectModel.js";

export class SubjectController {

    static async getAll(req, res) {
        try {
            const data = await SubjectModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await SubjectModel.getById(id);
            if (!data) return res.status(404).json({ message: "Subject not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const newSubject = await SubjectModel.create(req.body);
            res.status(201).json(newSubject);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedSubject = await SubjectModel.update(id, req.body);
            if (!updatedSubject) return res.status(404).json({ message: "Subject not found or no changes made" });
            res.status(200).json(updatedSubject);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedSubject = await SubjectModel.delete(id);
            if (!deletedSubject) return res.status(404).json({ message: "Subject not found" });
            res.status(200).json(deletedSubject);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
