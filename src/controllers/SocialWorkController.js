import { SocialWorkModel } from "../models/SocialWorkModel.js";

export class SocialWorkController {
    // Obtener todas las evaluaciones
    static async getAll(req, res) {
        try {
            const records = await SocialWorkModel.getAll();
            res.json(records);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Obtener una evaluación por ID
    static async getById(req, res) {
        const { id } = req.params;
        try {
            const record = await SocialWorkModel.getById(id);
            if (record) return res.json(record);
            res.status(404).json({ message: "Social work record not found" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Crear una evaluación de trabajo social
    static async create(req, res) {
        try {
            const { Internal_ID, ...data } = req.body;

            if (!Internal_ID) {
                return res.status(400).json({ error: "Internal_ID is required for auditing" });
            }

            const newRecord = await SocialWorkModel.create(data, Internal_ID);
            res.status(201).json({ message: "Social work record created successfully", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Actualizar una evaluación
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { Internal_ID, ...data } = req.body;

            if (!Internal_ID) {
                return res.status(400).json({ error: "Internal_ID is required for auditing" });
            }

            const updatedRecord = await SocialWorkModel.update(id, data, Internal_ID);

            if (!updatedRecord) return res.status(404).json({ message: "Social work record not found" });

            res.json({ message: "Social work record updated successfully", data: updatedRecord });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Eliminar (borrado lógico) una evaluación
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const { Internal_ID } = req.body;

            if (!Internal_ID) {
                return res.status(400).json({ error: "Internal_ID is required for auditing" });
            }

            const deletedRecord = await SocialWorkModel.delete(id, Internal_ID);
            if (!deletedRecord) return res.status(404).json({ message: "Social work record not found" });

            res.json({ message: "Social work record deleted (soft delete)", record: deletedRecord });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
