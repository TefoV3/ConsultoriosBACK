import { PracticalHoursModel } from "../../models/parameter_models/Practical_HoursModel.js";

export class PracticalHoursController {

    static async getAll(req, res) {
        try {
            const data = await PracticalHoursModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await PracticalHoursModel.getById(id);
            if (!data) return res.status(404).json({ message: "Practical hours not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            if (Array.isArray(req.body)) {
                const createdPracticalHours = await PracticalHoursModel.bulkCreate(req.body, internalId);
                return res.status(201).json(createdPracticalHours);
            }
            // Si es un objeto, usa create normal
            const newPracticalHours = await PracticalHoursModel.create(req.body, internalId);
            res.status(201).json(newPracticalHours);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const { id } = req.params;
            const updatedPracticalHours = await PracticalHoursModel.update(id, req.body, internalId);
            if (!updatedPracticalHours) return res.status(404).json({ message: "Practical hours not found or no changes made" });
            res.status(200).json(updatedPracticalHours);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const { id } = req.params;
            const deletedPracticalHours = await PracticalHoursModel.delete(id, internalId);
            if (!deletedPracticalHours) return res.status(404).json({ message: "Practical hours not found" });
            res.status(200).json(deletedPracticalHours);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
