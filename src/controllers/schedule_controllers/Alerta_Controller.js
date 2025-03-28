import { AlertaModel } from "../../models/schedule_models/Alerta.js";

export class AlertaController {
    static async getAlertas(req, res) {
        try {
            const alertas = await AlertaModel.getAlertas();
            res.json(alertas);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const alerta = await AlertaModel.getById(id);
            if (alerta) return res.json(alerta)
            res.status(404).json({ message: "Alerta no encontrada" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createAlerta(req, res) {
        try {
            const newAlerta = await AlertaModel.create(req.body);
            return res.status(201).json(newAlerta);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedAlerta = await AlertaModel.update(id, req.body);

            if (!updatedAlerta) return res.status(404).json({ message: "Alerta no encontrada" });

            return res.json(updatedAlerta);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedAlerta = await AlertaModel.delete(id);

            if (!deletedAlerta) return res.status(404).json({ message: "Alerta no encontrada" });
            return res.json({ message: "Alerta eliminada lógicamente", alerta: deletedAlerta });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}