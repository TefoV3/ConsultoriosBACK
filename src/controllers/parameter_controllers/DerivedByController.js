import { DerivedByModel } from "../../models/parameter_tables/DerivedByModel.js";

export class DerivedByController {

    static async getAll(req, res) {
        try {
            const data = await DerivedByModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await DerivedByModel.getById(id);
            if (!data) return res.status(404).json({ message: "Derived by record not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const newDerivedBy = await DerivedByModel.create(req.body);
            res.status(201).json(newDerivedBy);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedDerivedBy = await DerivedByModel.update(id, req.body);
            if (!updatedDerivedBy) return res.status(404).json({ message: "Derived by record not found or no changes made" });
            res.status(200).json(updatedDerivedBy);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedDerivedBy = await DerivedByModel.delete(id);
            if (!deletedDerivedBy) return res.status(404).json({ message: "Derived by record not found" });
            res.status(200).json(deletedDerivedBy);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
