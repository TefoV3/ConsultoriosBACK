import { ActivityModel } from "../models/ActividadModel.js";

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
            const newActivity = await ActivityModel.create(req.body);
            return res.status(201).json(newActivity);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedActivity = await ActivityModel.update(id, req.body);
            if (!updatedActivity) return res.status(404).json({ message: "Activity not found" });

            return res.json(updatedActivity);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedActivity = await ActivityModel.delete(id);
            if (!deletedActivity) return res.status(404).json({ message: "Activity not found" });

            return res.json({ message: "Activity deleted", activity: deletedActivity });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
