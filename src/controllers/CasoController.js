import { CasoModel } from "../models/CasoModel.js";

export class CasoController {
    static async getCasos(req, res) {
        try {
            const casos = await CasoModel.getAll();
            res.json(casos);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const caso = await CasoModel.getById(id);
            if (caso) return res.json(caso);
            res.status(404).json({ message: "Caso no encontrado" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createCaso(req, res) {
        try {
            const newCaso = await CasoModel.create(req.body);
            return res.status(201).json(newCaso);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedCaso = await CasoModel.update(id, req.body);
            if (!updatedCaso) return res.status(404).json({ message: "Caso no encontrado" });

            return res.json(updatedCaso);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedCaso = await CasoModel.delete(id);
            if (!deletedCaso) return res.status(404).json({ message: "Caso no encontrado" });

            return res.json({ message: "Caso eliminado lógicamente", caso: deletedCaso });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
