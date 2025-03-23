import { LivingGroupModel } from "../models/LivingGroupModel.js";

export class LivingGroupController {
    static async getAll(req, res) {
        try {
            const data = await LivingGroupModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await LivingGroupModel.getById(id);
            if (!data) return res.status(404).json({ message: "Living group not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getByProcessNumber(req, res) {
        try {
            const { processNumber } = req.params;
            const data = await LivingGroupModel.getByProcessNumber(processNumber);
            if (!data.length) return res.status(404).json({ message: "No living groups found for this process number" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const newLivingGroup = await LivingGroupModel.create(req.body);
            res.status(201).json(newLivingGroup);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedLivingGroup = await LivingGroupModel.update(id, req.body);
            if (!updatedLivingGroup) return res.status(404).json({ message: "Living group not found or no changes made" });
            res.status(200).json(updatedLivingGroup);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedLivingGroup = await LivingGroupModel.delete(id);
            if (!deletedLivingGroup) return res.status(404).json({ message: "Living group not found" });
            res.status(200).json(deletedLivingGroup);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
