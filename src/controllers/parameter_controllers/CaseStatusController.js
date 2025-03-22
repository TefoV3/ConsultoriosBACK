import { CaseStatusModel } from "../../models/parameter_models/CaseStatusModel.js";

export class CaseStatusController {

    static async getAll(req, res) {
        try {
            const caseStatuss = await CaseStatusModel.getAll();
            res.status(200).json(caseStatuss);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const caseStatus = await CaseStatusModel.getById(req.params.id);
            if (!caseStatus) {
                res.status(404).json({ error: `Case Status with id ${req.params.id} not found` });
                return;
            }
            res.status(200).json(caseStatus);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const caseStatus = await CaseStatusModel.create(req.body);
            res.status(201).json(caseStatus);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const caseStatus = await CaseStatusModel.update(req.params.id, req.body);
            if (!caseStatus) {
                res.status(404).json({ error: `Case Status with id ${req.params.id} not found` });
                return;
            }
            res.status(200).json(caseStatus);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const caseStatus = await CaseStatusModel.delete(req.params.id);
            if (!caseStatus) {
                res.status(404).json({ error: `Case Status with id ${req.params.id} not found` });
                return;
            }
            res.status(200).json(caseStatus);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}