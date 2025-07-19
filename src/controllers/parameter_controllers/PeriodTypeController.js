import { PeriodTypeModel } from "../../models/parameter_models/Period_TypeModel.js";

export class PeriodTypeController {

    static async getAll(req, res) {
        try {
            const data = await PeriodTypeModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await PeriodTypeModel.getById(id);
            if (!data) return res.status(404).json({ message: "Period type not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            if (Array.isArray(req.body)) {
                const createdPeriodType = await PeriodTypeModel.bulkCreate(req.body, internalId);
                return res.status(201).json(createdPeriodType);
            }
            // Si es un objeto, usa create normal
            const newPeriodType = await PeriodTypeModel.create(req.body, internalId);
            res.status(201).json(newPeriodType);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const { id } = req.params;
            const updatedPeriodType = await PeriodTypeModel.update(id, req.body, internalId);
            if (!updatedPeriodType) return res.status(404).json({ message: "Period type not found or no changes made" });
            res.status(200).json(updatedPeriodType);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const { id } = req.params;
            const deletedPeriodType = await PeriodTypeModel.delete(id, internalId);
            if (!deletedPeriodType) return res.status(404).json({ message: "Period type not found" });
            res.status(200).json(deletedPeriodType);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
