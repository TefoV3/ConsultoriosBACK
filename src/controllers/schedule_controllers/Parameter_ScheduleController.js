import { Parameter_ScheduleModel } from "../../models/schedule_models/Parameter_ScheduleModel.js";

export class Parameter_ScheduleController {
  // 1. Get all active records
  static async getAll(req, res) {
    try {
      const schedules = await Parameter_ScheduleModel.getAll();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 2. Get by ID
  static async getById(req, res) {
    const { parameterScheduleId } = req.params;
    try {
      const schedule = await Parameter_ScheduleModel.getById(parameterScheduleId);
      if (schedule) return res.json(schedule);
      res.status(404).json({ message: "Parameter schedule not found" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 3. Get available schedules by type (Temprano / Tarde)
  static async getAvailableByType(req, res) {
    const { type, periodId, area, day } = req.params;
    try {
      const available = await Parameter_ScheduleModel.getAvailableByType(type, periodId, area, day);
      res.json(Array.isArray(available) ? available : [available]);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 4. Create new parameter schedule
  static async create(req, res) {
    try {
      const newSchedule = await Parameter_ScheduleModel.create(req.body);
      res.status(201).json(newSchedule);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 5. Update a parameter schedule
  static async update(req, res) {
    const { parameterScheduleId } = req.params;
    try {
      const updated = await Parameter_ScheduleModel.update(parameterScheduleId, req.body);
      if (!updated) return res.status(404).json({ message: "Parameter schedule not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 6. Soft delete a parameter schedule
  static async delete(req, res) {
    const { parameterScheduleId } = req.params;
    try {
      const deleted = await Parameter_ScheduleModel.delete(parameterScheduleId);
      if (deleted) return res.json({ message: "Parameter schedule deleted" });
      res.status(404).json({ message: "Parameter schedule not found" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
