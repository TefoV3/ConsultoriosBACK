// controllers/schedule_controllers/Student_Hours_SummaryController.js
import { Student_Hours_SummaryModel } from "../../models/schedule_models/Student_Hours_SummaryModel.js";

export class Student_Hours_SummaryController {
  static async getAll(req, res) {
    try {
      const summaries = await Student_Hours_SummaryModel.getAll();
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    try {
      const summary = await Student_Hours_SummaryModel.getById(id);
      if (summary) return res.json(summary);
      res.status(404).json({ message: "Summary not found" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const newSummary = await Student_Hours_SummaryModel.create(req.body);
      return res.status(201).json(newSummary);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updatedSummary = await Student_Hours_SummaryModel.update(id, req.body);

      if (!updatedSummary) {
        return res.status(404).json({ message: "Summary not found" });
      }

      return res.json(updatedSummary);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Student_Hours_SummaryModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Summary not found" });
      }

      return res.json({
        message: "Summary logically deleted",
        summary: deleted
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getAllWithStudents(req, res) {
    try {
      const summaries = await Student_Hours_SummaryModel.getAllWithStudents();
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByCedula(req, res) {
    const { id } = req.params;
    try {
      const summary = await Student_Hours_SummaryModel.getByCedula(id);
      if (!summary) {
        return res.status(404).json({ message: "Summary not found for this student" });
      }
      res.status(200).json(summary);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByUser(req, res) {
    const { id } = req.params;
    try {
      const summary = await Student_Hours_SummaryModel.getByUser(id);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getWithUserDetails(req, res) {
    const { id } = req.params;
    try {
      const summary = await Student_Hours_SummaryModel.getWithUserDetails(id);
      if (!summary) {
        return res.status(404).json({ message: "Summary not found for this user" });
      }
      res.status(200).json(summary);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
