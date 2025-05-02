import { Weekly_Hours_SummaryModel } from "../../models/schedule_models/Weekly_Hours_SummaryModel.js";

export class Weekly_Hours_SummaryController {
  // 🔹 Get all active weekly summaries
  static async getAll(req, res) {
    try {
      const summaries = await Weekly_Hours_SummaryModel.getAll();
      res.status(200).json(summaries);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Get weekly summaries by General Summary ID
  static async getByGeneralSummaryId(req, res) {
    try {
      const { generalSummaryId } = req.params;
      const summaries = await Weekly_Hours_SummaryModel.getByGeneralSummaryId(generalSummaryId);
      if (!summaries || summaries.length === 0) {
        res.status(404).json({ message: "No weekly summaries found for the specified general summary." });
      } else {
        res.status(200).json(summaries);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Get a single weekly summary by ID
  static async getById(req, res) {
    const { id } = req.params;
    try {
      const summary = await Weekly_Hours_SummaryModel.getById(id);
      if (summary) {
        res.status(200).json(summary);
      } else {
        res.status(404).json({ message: "Weekly summary not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Create a new weekly summary
  static async create(req, res) {
    try {
      const data = req.body;
      const newSummary = await Weekly_Hours_SummaryModel.create(data);
      res.status(201).json(newSummary);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Update an existing weekly summary
  static async update(req, res) {
    const { id } = req.params;
    try {
      const data = req.body;
      const updated = await Weekly_Hours_SummaryModel.update(id, data);
      if (updated) {
        res.status(200).json(updated);
      } else {
        res.status(404).json({ message: "Weekly summary not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Logical delete of a weekly summary
  static async delete(req, res) {
    const { id } = req.params;
    try {
      const deleted = await Weekly_Hours_SummaryModel.delete(id);
      if (deleted) {
        res.status(200).json({ message: "Weekly summary deleted successfully" });
      } else {
        res.status(404).json({ message: "Weekly summary not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
