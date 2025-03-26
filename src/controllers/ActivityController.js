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
            const internalId = req.headers["internal-id"]; // ✅ Se obtiene el usuario interno desde los headers

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            const newActivity = await ActivityModel.create(req.body, internalId);
            return res.status(201).json(newActivity);
        } catch (error) {
            return res.status(500).json({ error: error.message });
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
    
}
