import { ScheduleStudentsModel } from "../../models/schedule_models/Schedule_StudentsModel.js";

export class Schedule_StudentsController {
  static async getAll(req, res) {
    try {
      const schedules = await ScheduleStudentsModel.getAllSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const schedule = await ScheduleStudentsModel.getById(id);
      if (schedule) return res.json(schedule);
      res.status(404).json({ message: "Schedule not found" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getAvailability(req, res) {
    try {
      const { periodId, area, day } = req.params;
      const decodedArea = decodeURIComponent(area);
      const availability = await ScheduleStudentsModel.getAvailabilityByDay(periodId, decodedArea, day);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getByUserXPeriod(req, res) {
    try {
      const { userXPeriodId } = req.params;
      const schedules = await ScheduleStudentsModel.getSchedulesByUserPeriod(userXPeriodId);
      if (!schedules || schedules.length === 0) {
        return res.status(404).json({ message: "No schedules assigned" });
      }
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getFullByPeriodAndArea(req, res) {
    try {
      const { periodId, area } = req.query;
      if (!periodId || !area) {
        return res.status(400).json({ message: "Missing parameters: periodId and area are required" });
      }
      const schedules = await ScheduleStudentsModel.getAllFullSchedules(periodId, area);
      res.status(200).json(schedules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getFullForExport(req, res) {
    try {
      const { periodId, area } = req.query;
      const schedules = await ScheduleStudentsModel.getFullSchedulesForExport(periodId, area);
      res.status(200).json(schedules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getFullByStudent(req, res) {
    try {
      const { internalId } = req.params;
      if (!internalId) {
        return res.status(400).json({ message: "Missing parameter: internalId" });
      }
      const schedules = await ScheduleStudentsModel.getFullScheduleByStudent(internalId);
      if (!schedules || schedules.length === 0) {
        return res.status(404).json({ message: "No schedules found for this student" });
      }
      res.status(200).json(schedules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getFullByUserXPeriod(req, res) {
    try {
      const { userXPeriodId } = req.params;
      const { mode } = req.query;
      if (!userXPeriodId) {
        return res.status(400).json({ message: "Missing parameter: userXPeriodId" });
      }
      const schedules = await ScheduleStudentsModel.getFullScheduleByUserXPeriod(userXPeriodId, mode);
      if (!schedules || schedules.length === 0) {
        return res.status(404).json({ message: "No schedules found for this user" });
      }
      res.status(200).json(schedules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async adminChange(req, res) {
    try {
      const { userXPeriodId, newSchedules } = req.body;
      const internalId = req.headers['internal-id'];
      console.log(userXPeriodId, newSchedules);
      if (!userXPeriodId || !Array.isArray(newSchedules) || newSchedules.length === 0) {
        return res.status(400).json({ message: "Incomplete data for administrative change" });
      }
      const result = await ScheduleStudentsModel.adminChange(userXPeriodId, newSchedules, internalId);
      res.status(200).json({ message: result.message });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const internalId = req.headers['internal-id'];
      const updated = await ScheduleStudentsModel.update(id, req.body, internalId);
      if (!updated) return res.status(404).json({ message: "Schedule not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const internalId = req.headers['internal-id'];
      const deleted = await ScheduleStudentsModel.delete(id, internalId);
      if (!deleted) return res.status(404).json({ message: "Schedule not found" });
      res.json({ message: "Schedule logically deleted", schedule: deleted });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async create(req, res) {
    try {
      const internalId = req.headers['internal-id'];
      const newSchedule = await ScheduleStudentsModel.create(req.body, internalId);
      res.status(201).json(newSchedule);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
