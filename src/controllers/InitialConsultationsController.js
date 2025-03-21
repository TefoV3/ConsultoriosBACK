import { InitialConsultationsModel } from "../models/InitialConsultationsModel.js";

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

    static async getByUserId(req, res) {
        const { userId } = req.params;
        try {
            const consultations = await InitialConsultationsModel.getByUserId(userId);
            res.json(consultations);
        }
        catch (error) {
            res.status(500).json(error);
        }
    }

    static async createFirstConsultations(req, res) {
        try {
            const { Internal_ID, Init_Code, Evidence_Name } = req.body;

            if (!req.file) {
                return res.status(400).json({ error: "Debe adjuntar un archivo PDF." });
            }

            const newConsultation = await InitialConsultationsModel.createInitialConsultation(req.body, req.file);

            res.status(201).json({ message: "Consulta inicial creada con evidencia", data: newConsultation });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];  // ✅ Se obtiene el usuario interno desde los headers

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            const updatedConsultation = await InitialConsultationsModel.update(id, req.body, internalId);

            if (!updatedConsultation) return res.status(404).json({ message: "Consulta inicial no encontrada" });

            return res.json(updatedConsultation);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];  // ✅ Se obtiene el usuario interno desde los headers

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            const deletedConsultation = await InitialConsultationsModel.delete(id, internalId);

            if (!deletedConsultation) return res.status(404).json({ message: "Consulta inicial no encontrada" });

            return res.json({ message: "Consulta inicial eliminada", data: deletedConsultation });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
