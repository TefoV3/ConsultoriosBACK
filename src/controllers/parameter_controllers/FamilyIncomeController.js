import { FamilyIncomeModel } from "../../models/parameter_models/Family_IncomeModel.js";

export class FamilyIncomeController {

    static async getAll(req, res) {
        try {
            const FamilyIncome = await FamilyIncomeModel.getAll();
            res.status(200).json(FamilyIncome);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const id = req.params.id;
            const FamilyIncome = await FamilyIncomeModel.getById(id);
            if (!FamilyIncome) {
                res.status(404).json({ error: 'Family Income not found' });
            } else {
                res.status(200).json(FamilyIncome);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            if (Array.isArray(req.body)) {
                const createdFamilyIncome = await FamilyIncomeModel.bulkCreate(req.body, internalId);
                return res.status(201).json(createdFamilyIncome);
            }
            // Si es un objeto, usa create normal
            const FamilyIncome = req.body;
            const newFamilyIncome = await FamilyIncomeModel.create(FamilyIncome, internalId);
            res.status(201).json(newFamilyIncome);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const id = req.params.id;
            const updatedFamilyIncome = await FamilyIncomeModel.update(id, req.body, internalId);
            if (!updatedFamilyIncome) {
                res.status(404).json({ error: 'Family Income not found' });
            } else {
                res.status(200).json(updatedFamilyIncome);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const id = req.params.id;
            const deletedFamilyIncome = await FamilyIncomeModel.delete(id, internalId);
            if (!deletedFamilyIncome) {
                res.status(404).json({ error: 'Family Income not found' });
            } else {
                res.status(200).json(deletedFamilyIncome);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}