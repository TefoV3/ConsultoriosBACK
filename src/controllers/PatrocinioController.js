import { PatrocinioModel } from "../models/PatrocinioModel.js";

export class PatrocinioController {
    static async createPatrocinio(req, res) {
        try {
            const nuevoPatrocinio = await PatrocinioModel.gestionarPatrocinio("INSERT", req.body);
            res.status(201).json({ message: "Patrocinio creado exitosamente", data: nuevoPatrocinio });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getPatrocinio(req, res) {
        try {
            const { Prim_Codigo } = req.params;
            const patrocinio = await PatrocinioModel.gestionarPatrocinio("SELECT", { Prim_Codigo });
            if (!patrocinio.length) return res.status(404).json({ message: "Patrocinio no encontrado" });
            res.json(patrocinio);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updatePatrocinio(req, res) {
        try {
            const updatedPatrocinio = await PatrocinioModel.gestionarPatrocinio("UPDATE", req.body);
            res.json({ message: "Patrocinio actualizado", data: updatedPatrocinio });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deletePatrocinio(req, res) {
        try {
            const { Prim_Codigo } = req.params;
            await PatrocinioModel.gestionarPatrocinio("DELETE", { Prim_Codigo });
            res.json({ message: "Patrocinio eliminado exitosamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
