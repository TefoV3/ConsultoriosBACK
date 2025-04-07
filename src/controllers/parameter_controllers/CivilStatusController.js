import { CivilStatusModel } from "../../models/parameter_models/CivilStatusModel.js";

export class CivilStatusController {

    static async getAll(req, res) {
        try {
            const data = await CivilStatusModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await CivilStatusModel.getById(id);
            if (!data) return res.status(404).json({ message: "Civil status not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            if (Array.isArray(req.body)) {
                const createdCivilStatus = await CivilStatusModel.bulkCreate(req.body);
                return res.status(201).json(createdCivilStatus);
            }
            // Si es un objeto, usa create normal
            const newCivilStatus = await CivilStatusModel.create(req.body);
            res.status(201).json(newCivilStatus);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedCivilStatus = await CivilStatusModel.update(id, req.body);
            if (!updatedCivilStatus) return res.status(404).json({ message: "Civil status not found or no changes made" });
            res.status(200).json(updatedCivilStatus);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedCivilStatus = await CivilStatusModel.delete(id);
            if (!deletedCivilStatus) return res.status(404).json({ message: "Civil status not found" });
            res.status(200).json(deletedCivilStatus);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
