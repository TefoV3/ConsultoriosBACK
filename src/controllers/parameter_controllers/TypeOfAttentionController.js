import { TypeOfAttentionModel } from "../../models/parameter_models/Type_Of_AttentionModel.js";

export class TypeOfAttentionController {

    static async getAll(req, res) {
        try {
            const typeOfAttentions = await TypeOfAttentionModel.getAll();
            res.status(200).json(typeOfAttentions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const typeOfAttention = await TypeOfAttentionModel.getById(req.params.id);
            if (!typeOfAttention) {
                res.status(404).json({ error: `Type of Attention with id ${req.params.id} not found` });
                return;
            }
            res.status(200).json(typeOfAttention);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            if (Array.isArray(req.body)) {
                const createdtypeOfAttention = await TypeOfAttentionModel.bulkCreate(req.body);
                return res.status(201).json(createdtypeOfAttention);
            }
            // Si es un objeto, usa create normal
            const typeOfAttention = await TypeOfAttentionModel.create(req.body);
            res.status(201).json(typeOfAttention);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const typeOfAttention = await TypeOfAttentionModel.update(req.params.id, req.body);
            if (!typeOfAttention) {
                res.status(404).json({ error: `Type of Attention with id ${req.params.id} not found` });
                return;
            }
            res.status(200).json(typeOfAttention);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const typeOfAttention = await TypeOfAttentionModel.delete(req.params.id);
            if (!typeOfAttention) {
                res.status(404).json({ error: `Type of Attention with id ${req.params.id} not found` });
                return;
            }
            res.status(200).json(typeOfAttention);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}