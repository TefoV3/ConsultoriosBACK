import { CaseStatusModel } from "../../models/parameter_models/Case_StatusModel.js";

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
            const internalId = req.headers["internal-id"]
            // Si el body es un array, usa bulkCreate
                if (Array.isArray(req.body)) {
                    const createdcaseStatus = await CaseStatusModel.bulkCreate(req.body, internalId);
                    return res.status(201).json(createdcaseStatus);
                }
                // Si es un objeto, usa create normal
            const caseStatus = await CaseStatusModel.create(req.body, internalId);
            res.status(201).json(caseStatus);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const caseStatus = await CaseStatusModel.update(req.params.id, req.body, internalId);
            
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
            const internalId = req.headers["internal-id"]
            const caseStatus = await CaseStatusModel.delete(req.params.id, internalId);
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