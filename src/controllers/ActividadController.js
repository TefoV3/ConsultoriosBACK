import { ActividadModel } from "../models/ActividadModel.js";

export class ActividadController {
    static async getActividades(req, res) {
        try {
            const actividades = await ActividadModel.getAll();
            res.json(actividades);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const actividad = await ActividadModel.getById(id);
            if (actividad) return res.json(actividad);
            res.status(404).json({ message: "Actividad no encontrada" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createActividad(req, res) {
        try {
            const newActividad = await ActividadModel.create(req.body);
            return res.status(201).json(newActividad);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedActividad = await ActividadModel.update(id, req.body);
            if (!updatedActividad) return res.status(404).json({ message: "Actividad no encontrada" });

            return res.json(updatedActividad);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedActividad = await ActividadModel.delete(id);
            if (!deletedActividad) return res.status(404).json({ message: "Actividad no encontrada" });

            return res.json({ message: "Actividad eliminada", actividad: deletedActividad });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
