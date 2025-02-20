import { AsignacionModel } from "../models/AsignacionModel.js";

export class AsignacionController {
    static async getAsignaciones(req, res) {
        try {
            const asignaciones = await AsignacionModel.getAll();
            res.json(asignaciones);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const asignacion = await AsignacionModel.getById(id);
            if (asignacion) return res.json(asignacion);
            res.status(404).json({ message: "Asignación no encontrada" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createAsignacion(req, res) {
        try {
            const newAsignacion = await AsignacionModel.create(req.body);
            return res.status(201).json(newAsignacion);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedAsignacion = await AsignacionModel.update(id, req.body);
            if (!updatedAsignacion) return res.status(404).json({ message: "Asignación no encontrada" });

            return res.json(updatedAsignacion);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedAsignacion = await AsignacionModel.delete(id);
            if (!deletedAsignacion) return res.status(404).json({ message: "Asignación no encontrada" });

            return res.json({ message: "Asignación eliminada", asignacion: deletedAsignacion });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
