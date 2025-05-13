import { Extra_HoursModel } from "../../models/schedule_models/Extra_HoursModel.js";

export class Extra_HoursController {
  static async getAll(req, res) {
    try {
      const hours = await Extra_HoursModel.getAll();
      res.json(hours);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    try {
      const hour = await Extra_HoursModel.getById(id);
      if (hour) return res.json(hour);
      res.status(404).json({ message: "Extra hour not found" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const newHour = await Extra_HoursModel.create(req.body);
      return res.status(201).json(newHour);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Creates an extra hour adjustment and updates or creates the student's summary.
   */
  static async createWithSummary(req, res) {
    try {
      const newHour = await Extra_HoursModel.createWithSummary(req.body);
      return res.status(201).json(newHour);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await Extra_HoursModel.update(id, req.body);

      if (!updated)
        return res.status(404).json({ message: "Extra hour not found" });

      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Extra_HoursModel.delete(id);

      if (!deleted)
        return res.status(404).json({ message: "Extra hour not found" });

      return res.json({
        message: "Extra hour logically deleted",
        deletedHour: deleted
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getByUser(req, res) {
    try {
      const hours = await Extra_HoursModel.getByUser(req.params.id);
      res.json(hours);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
