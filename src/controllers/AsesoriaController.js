import { AsesoriaModel } from "../models/AsesoriaModel.js";

export class AsesoriaController {
    static async createAsesoria(req, res) {
        try {
            const nuevaAsesoria = await AsesoriaModel.gestionarAsesoria("INSERT", req.body);
            res.status(201).json({ message: "Asesoría creada exitosamente", data: nuevaAsesoria });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateAsesoria(req, res) {
        try {
            const updatedAsesoria = await AsesoriaModel.gestionarAsesoria("UPDATE", req.body);
            res.json({ message: "Asesoría actualizada", data: updatedAsesoria });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteAsesoria(req, res) {
        try {
            const { Prim_Codigo } = req.params;
            await AsesoriaModel.gestionarAsesoria("DELETE", { Prim_Codigo });
            res.json({ message: "Asesoría eliminada exitosamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAsesoria(req, res) {
        try {
            const { Prim_Codigo } = req.params;
            const asesoria = await AsesoriaModel.gestionarAsesoria("SELECT", { Prim_Codigo });
            if (asesoria.length === 0) return res.status(404).json({ message: "Asesoría no encontrada" });
            res.json(asesoria);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
