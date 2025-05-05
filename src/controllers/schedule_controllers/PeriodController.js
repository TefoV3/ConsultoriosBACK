import { PeriodModel } from "../../models/schedule_models/PeriodModel.js";

export class PeriodController {
  static async getPeriods(req, res) {
    try {
      const periods = await PeriodModel.getPeriods();
      res.json(periods);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    try {
      const period = await PeriodModel.getById(id);
      if (period) return res.json(period);
      res.status(404).json({ message: "Period not found" });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async getPeriodWithTracking(req, res) {
    const { id } = req.params;
    console.log(`Fetching period with ID: ${id}`);
    try {
      const period = await PeriodModel.getPeriodWithTracking(id);
      if (!period) {
        console.log(`Period with ID ${id} not found`);
        return res.status(404).json({ message: "Period not found" });
      }
      res.json(period);
    } catch (error) {
      res.status(500).json({ message: `Error fetching period: ${error.message}` });
    }
  }

  static async createPeriod(req, res) {
    try {
      const newPeriod = await PeriodModel.create(req.body);
      return res.status(201).json(newPeriod);
    } catch (error) {
      console.error(`❌ Error creating period: ${error.message}`);
      if (error.message.includes("overlapping")) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal error while creating the period." });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updatedPeriod = await PeriodModel.update(id, req.body);

      if (!updatedPeriod) return res.status(404).json({ message: "Period not found" });

      return res.json(updatedPeriod);
    } catch (error) {
      if (error.message.includes("overlapping")) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal error while updating the period." });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedPeriod = await PeriodModel.delete(id);

      if (!deletedPeriod) return res.status(404).json({ message: "Period not found" });
      return res.json({ message: "Period logically deleted", period: deletedPeriod });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
