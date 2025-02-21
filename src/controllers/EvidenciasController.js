import { EvidenciaModel } from "../models/EvidenciasModel.js";

export class EvidenciaController {
    static async getEvidencias(req, res) {
        try {
            const evidencias = await EvidenciaModel.getAll();
            res.json(evidencias);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const evidencia = await EvidenciaModel.getById(id);
            if (evidencia) return res.json(evidencia);
            res.status(404).json({ message: "Evidencia no encontrada" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createEvidencia(req, res) {
        try {
            const newEvidencia = await EvidenciaModel.create(req.body);
            return res.status(201).json(newEvidencia);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedEvidencia = await EvidenciaModel.update(id, req.body);
            if (!updatedEvidencia) return res.status(404).json({ message: "Evidencia no encontrada" });

            return res.json(updatedEvidencia);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedEvidencia = await EvidenciaModel.delete(id);
            if (!deletedEvidencia) return res.status(404).json({ message: "Evidencia no encontrada" });

            return res.json({ message: "Evidencia eliminada", evidencia: deletedEvidencia });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
