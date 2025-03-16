import { InitialConsultationsModel } from "../models/Initial_ConsultationsModel.js";

export class FirstConsultationsController {
    static async getFirstConsultations(req, res) {
        try {
            const consultations = await InitialConsultationsModel.getAll();
            res.json(consultations);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const consultation = await InitialConsultationsModel.getById(id);
            if (consultation) return res.json(consultation);
            res.status(404).json({ message: "First consultation not found" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createFirstConsultations(req, res) {
        try {
            const response = await InitialConsultationsModel.createInitialConsultation(req.body);
            res.status(201).json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedConsultation = await InitialConsultationsModel.update(id, req.body);
            if (!updatedConsultation) return res.status(404).json({ message: "First consultation not found" });

            return res.json(updatedConsultation);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedConsultation = await InitialConsultationsModel.delete(id);
            if (!deletedConsultation) return res.status(404).json({ message: "First consultation not found" });

            return res.json({ message: "First consultation deleted", consultation: deletedConsultation });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
