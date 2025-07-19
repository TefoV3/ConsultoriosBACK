import { SexModel } from "../../models/parameter_models/SexModel.js";

export class SexController {

    static async getAll(req, res) {
        try {
            const data = await SexModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await SexModel.getById(id);
            if (!data) return res.status(404).json({ message: "Sex not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            if (Array.isArray(req.body)) {
                const createdSex = await SexModel.bulkCreate(req.body, internalId);
                return res.status(201).json(createdSex);
            }
            // Si es un objeto, usa create normal
            const newSex = await SexModel.create(req.body, internalId);
            res.status(201).json(newSex);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const { id } = req.params;
            const updatedSex = await SexModel.update(id, req.body, internalId);
            if (!updatedSex) return res.status(404).json({ message: "Sex not found or no changes made" });
            res.status(200).json(updatedSex);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const { id } = req.params;
            const deletedSex = await SexModel.delete(id, internalId);
            if (!deletedSex) return res.status(404).json({ message: "Sex not found" });
            res.status(200).json(deletedSex);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
