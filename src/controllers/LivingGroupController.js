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
            const { Internal_ID, ...livingGroupData } = req.body;
            const newLivingGroup = await LivingGroupModel.create(livingGroupData, Internal_ID);
            const internalId = req.headers["internal-id"]
            const newLivingGroup = await LivingGroupModel.create(req.body, internalId);
            res.status(201).json(newLivingGroup);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { Internal_ID, ...updateData } = req.body;
            const updatedLivingGroup = await LivingGroupModel.update(id, updateData, Internal_ID);
            const internalId = req.headers["internal-id"]
            const updatedLivingGroup = await LivingGroupModel.update(id, req.body, internalId);
            if (!updatedLivingGroup) return res.status(404).json({ message: "Living group not found or no changes made" });
            res.status(200).json(updatedLivingGroup);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const { Internal_ID } = req.body;
            const deletedLivingGroup = await LivingGroupModel.delete(id, Internal_ID);
            const internalId = req.headers["internal-id"]
            const deletedLivingGroup = await LivingGroupModel.delete(id, internalId);
            if (!deletedLivingGroup) return res.status(404).json({ message: "Living group not found" });
            res.status(200).json(deletedLivingGroup);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
