import { CaseModel } from "../models/CasoModel.js";

export class CaseController {
    static async getCases(req, res) {
        try {
            const cases = await CaseModel.getAll();
            res.json(cases);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const caseData = await CaseModel.getById(id);
            if (caseData) return res.json(caseData);
            res.status(404).json({ message: "Case not found" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createCase(req, res) {
        try {
            const newCase = await CaseModel.create(req.body);
            return res.status(201).json(newCase);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedCase = await CaseModel.update(id, req.body);
            if (!updatedCase) return res.status(404).json({ message: "Case not found" });

            return res.json(updatedCase);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedCase = await CaseModel.delete(id);
            if (!deletedCase) return res.status(404).json({ message: "Case not found" });

            return res.json({ message: "Case logically deleted", case: deletedCase });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
