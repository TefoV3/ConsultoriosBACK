import { ActivityModel } from "../models/ActivityModel.js";

export class ActivityController {
    static async getActivities(req, res) {
        try {
            const activities = await ActivityModel.getAll();
            res.json(activities);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const activity = await ActivityModel.getById(id);
            if (activity) return res.json(activity);
            res.status(404).json({ message: "Activity not found" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createActivity(req, res) {
        try {
            console.log("📥 Recibiendo solicitud para crear actividad...");
            const { Internal_ID, Init_Code } = req.body;

            if (!req.file) {
                console.error("❌ No se recibió ningún archivo.");
                return res.status(400).json({ error: "Debe adjuntar un archivo PDF." });
            }

            console.log("✅ Archivo recibido:", req.file.originalname);

            // Llamar al modelo y pasar `req.file`
            const newActivity = await ActivityModel.create(req.body, Internal_ID, req.file);

            res.status(201).json({ message: "Actividad creada con evidencia", data: newActivity });
        } catch (error) {
            console.error("❌ Error en la creación de actividad:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"]; // ✅ Se obtiene el usuario interno desde los headers

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            const updatedActivity = await ActivityModel.update(id, req.body, internalId);
            if (!updatedActivity) return res.status(404).json({ message: "Activity not found" });

            return res.json(updatedActivity);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"]; // ✅ Se obtiene el usuario interno desde los headers

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            const deletedActivity = await ActivityModel.delete(id, internalId);
            if (!deletedActivity) return res.status(404).json({ message: "Activity not found" });

            return res.json({ message: "Activity deleted", activity: deletedActivity });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
