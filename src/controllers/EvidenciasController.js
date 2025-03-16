import { EvidenceModel } from "../models/EvidenciasModel.js";

export class EvidenceController {
    static async getEvidences(req, res) {
        try {
            const evidences = await EvidenceModel.getAll();
            res.json(evidences);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const evidence = await EvidenceModel.getById(id);
            if (evidence) return res.json(evidence);
            res.status(404).json({ message: "Evidence not found" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createEvidence(req, res) {
        try {
            const newEvidence = await EvidenceModel.create(req.body);
            return res.status(201).json(newEvidence);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedEvidence = await EvidenceModel.update(id, req.body);
            if (!updatedEvidence) return res.status(404).json({ message: "Evidence not found" });

            return res.json(updatedEvidence);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedEvidence = await EvidenceModel.delete(id);
            if (!deletedEvidence) return res.status(404).json({ message: "Evidence not found" });

            return res.json({ message: "Evidence deleted", evidence: deletedEvidence });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
