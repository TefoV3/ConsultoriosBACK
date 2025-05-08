import { AlertModel } from "../../models/schedule_models/AlertModel.js";

export class AlertController {
  // Get all active alerts
  static async getAll(req, res) {
    try {
      const alerts = await AlertModel.getAll();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get alert by ID
  static async getById(req, res) {
    const { id } = req.params;
    try {
      const alert = await AlertModel.getById(id);
      if (alert) return res.json(alert);
      res.status(404).json({ message: "Alert not found" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create alert
  static async create(req, res) {
    try {
      const newAlert = await AlertModel.create(req.body);
      return res.status(201).json(newAlert);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Update alert
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updatedAlert = await AlertModel.update(id, req.body);
      if (!updatedAlert) return res.status(404).json({ message: "Alert not found" });
      return res.json(updatedAlert);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Soft delete alert
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedAlert = await AlertModel.delete(id);
      if (!deletedAlert) return res.status(404).json({ message: "Alert not found" });
      return res.json({ message: "Alert deleted logically", alert: deletedAlert });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Get alert by user ID
  static async getByUserId(req, res) {
    const { userId } = req.params;
    try {
      const alerts = await AlertModel.getByInternalId(userId);
      if (alerts.length > 0) return res.json(alerts);
      res.status(404).json({ message: "No alerts found for this user" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }


}
