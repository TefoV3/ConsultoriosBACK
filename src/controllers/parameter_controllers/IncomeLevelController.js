import { IncomeLevelModel } from "../../models/parameter_models/IncomeLevelModel.js";

export class IncomeLevelController {

    static async getAll(req, res) {
        try {
            const IncomeLevel = await IncomeLevelModel.getAll();
            res.status(200).json(IncomeLevel);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const id = req.params.id;
            const IncomeLevel = await IncomeLevelModel.getById(id);
            if (!IncomeLevel) {
                res.status(404).json({ error: 'Income Level not found' });
            } else {
                res.status(200).json(IncomeLevel);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            if (Array.isArray(req.body)) {
                const createdIncomeLevel = await IncomeLevelModel.bulkCreate(req.body);
                return res.status(201).json(createdIncomeLevel);
            }
            // Si es un objeto, usa create normal
            const IncomeLevel = req.body;
            const newIncomeLevel = await IncomeLevelModel.create(IncomeLevel);
            res.status(201).json(newIncomeLevel);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const id = req.params.id;
            const updatedIncomeLevel = await IncomeLevelModel.update(id, req.body);
            if (!updatedIncomeLevel) {
                res.status(404).json({ error: 'Income Level not found' });
            } else {
                res.status(200).json(updatedIncomeLevel);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const id = req.params.id;
            const deletedIncomeLevel = await IncomeLevelModel.delete(id);
            if (!deletedIncomeLevel) {
                res.status(404).json({ error: 'Income Level not found' });
            } else {
                res.status(200).json(deletedIncomeLevel);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}