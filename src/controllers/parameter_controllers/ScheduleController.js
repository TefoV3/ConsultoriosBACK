import { ScheduleModel } from '../../models/parameter_models/ScheduleModel.js';

export class ScheduleController {

    static async getAll(req, res) {
        try {
            const schedules = await ScheduleModel.getAll();
            res.status(200).json(schedules);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const schedule = await ScheduleModel.getById(req.params.id);
            if (schedule) res.status(200).json(schedule);
            else res.status(404).json({ message: "Schedule not found" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            if (Array.isArray(req.body)) {
                const createdschedule = await ScheduleModel.bulkCreate(req.body, internalId);
                return res.status(201).json(createdschedule);
            }
            // Si es un objeto, usa create normal
            const schedule = await ScheduleModel.create(req.body, internalId);
            res.status(201).json(schedule);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const schedule = await ScheduleModel.update(req.params.id, req.body, internalId);
            if (schedule) res.status(200).json(schedule);
            else res.status(404).json({ message: "Schedule not found" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const schedule = await ScheduleModel.delete(req.params.id, internalId);
            if (schedule) res.status(200).json(schedule);
            else res.status(404).json({ message: "Schedule not found" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


}



