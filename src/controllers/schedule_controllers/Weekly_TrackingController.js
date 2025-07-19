// controllers/schedule_controllers/Weekly_TrackingController.js

import { Weekly_TrackingModel } from "../../models/schedule_models/Weekly_TrackingModel.js";

export class Weekly_TrackingController {
  static async getAll(req, res) {
    try {
      const data = await Weekly_TrackingModel.getAll();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const tracking = await Weekly_TrackingModel.getById(id);

      if (tracking) {
        res.status(200).json(tracking);
      } else {
        res.status(404).json({ error: "Weekly tracking not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getLastByPeriod(req, res) {
    try {
      const periodId = parseInt(req.params.periodId);
      const tracking = await Weekly_TrackingModel.getLastByPeriod(periodId);

      if (tracking) {
        res.status(200).json(tracking);
      } else {
        res.status(404).json({ error: "Last weekly tracking not found for the period" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const internalId = req.headers["internal-id"];
      const newTracking = await Weekly_TrackingModel.create(req.body, internalId);
      res.status(201).json(newTracking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createBulk(req, res) {
    try {
      const internalId = req.headers["internal-id"];
      const created = await Weekly_TrackingModel.createBulk(req.body, internalId);
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      const internalId = req.headers["internal-id"];
      const updated = await Weekly_TrackingModel.update(id, req.body, internalId);

      if (updated) {
        res.status(200).json(updated);
      } else {
        res.status(404).json({ error: "Weekly tracking not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      const internalId = req.headers["internal-id"];
      const deleted = await Weekly_TrackingModel.delete(id, internalId);

      if (deleted) {
        res.status(200).json({ message: "Weekly tracking logically deleted", data: deleted });
      } else {
        res.status(404).json({ error: "Weekly tracking not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async recalculateWeeks(req, res) {
    try {
      const periodId = parseInt(req.params.periodId);
      const { newStartDate, newEndDate } = req.body;
      const internalId = req.headers["internal-id"];
  
      const result = await Weekly_TrackingModel.recalculateWeeks(
        periodId,
        new Date(newStartDate),
        new Date(newEndDate),
        internalId
      );
  
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
}
