import { EvidenceModel } from "../models/EvidencesModel.js";

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

    static async uploadEvidence(req, res) {
        try {
            const { Internal_ID, Init_Code, Evidence_Name } = req.body;

            if (!req.file) {
                return res.status(400).json({ error: "Debe adjuntar un archivo PDF." });
            }

            const newEvidence = await EvidenceModel.createEvidence({
                Internal_ID,
                Init_Code,
                Evidence_Name
            }, req.file);

            res.status(201).json({ message: "Evidencia subida correctamente", data: newEvidence });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async downloadEvidence(req, res) {
        try {
            const { id } = req.params;
            const evidence = await EvidenceModel.getEvidenceById(id);

            if (!evidence) {
                return res.status(404).json({ error: "Evidencia no encontrada." });
            }

            res.set({
                "Content-Type": evidence.Evidence_Document_Type,
                "Content-Disposition": `attachment; filename=${evidence.Evidence_Name}`
            });

            res.send(evidence.Evidence_File);
        } catch (error) {
            res.status(500).json({ error: error.message });
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
