import { NumberOfAttemptsModel } from "../../models/parameter_models/Number_Of_AttemptsModel.js";

export class NumberOfAttemptsController {

    static async getAll(req, res) {
        try {
            const data = await NumberOfAttemptsModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getCurrent(req, res) {
        try {
            const data = await NumberOfAttemptsModel.getCurrent();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await NumberOfAttemptsModel.getById(id);
            if (!data) return res.status(404).json({ message: "Number of attempts not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            if (Array.isArray(req.body)) {
                const creatednewNumberOfAttempts = await NumberOfAttemptsModel.bulkCreate(req.body);
                return res.status(201).json(creatednewNumberOfAttempts);
            }
            // Si es un objeto, usa create normal
            const newNumberOfAttempts = await NumberOfAttemptsModel.create(req.body);
            res.status(201).json(newNumberOfAttempts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedNumberOfAttempts = await NumberOfAttemptsModel.update(id, req.body);
            if (!updatedNumberOfAttempts) return res.status(404).json({ message: "Number of attempts not found or no changes made" });
            res.status(200).json(updatedNumberOfAttempts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedNumberOfAttempts = await NumberOfAttemptsModel.delete(id);
            if (!deletedNumberOfAttempts) return res.status(404).json({ message: "Number of attempts not found" });
            res.status(200).json(deletedNumberOfAttempts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
