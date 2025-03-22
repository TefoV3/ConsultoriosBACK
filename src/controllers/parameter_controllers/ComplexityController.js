import { ComplexityModel } from "../../models/parameter_tables/ComplexityModel.js";

export class ComplexityController {

    static async getAll(req, res) {
        try {
            const data = await ComplexityModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await ComplexityModel.getById(id);
            if (!data) return res.status(404).json({ message: "Complexity not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const newComplexity = await ComplexityModel.create(req.body);
            res.status(201).json(newComplexity);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedComplexity = await ComplexityModel.update(id, req.body);
            if (!updatedComplexity) return res.status(404).json({ message: "Complexity not found or no changes made" });
            res.status(200).json(updatedComplexity);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedComplexity = await ComplexityModel.delete(id);
            if (!deletedComplexity) return res.status(404).json({ message: "Complexity not found" });
            res.status(200).json(deletedComplexity);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
