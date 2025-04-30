import { Attendance_RecordModel } from "../../models/schedule_models/Attendance_RecordModel.js";

export class Attendance_Record_Controller {
  // 🔹 Get all active records
  static async getAll(req, res) {
    try {
      const records = await Attendance_RecordModel.getAllRecords();
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Get record by ID
  static async getById(req, res) {
    try {
      const id = req.params.id;
      const record = await Attendance_RecordModel.getById(id);
      if (!record) {
        res.status(404).json({ message: "Attendance record not found" });
      } else {
        res.status(200).json(record);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Create attendance only
  static async create(req, res) {
    try {
      const data = req.body;
      const record = await Attendance_RecordModel.create(data);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Create with summary update
  static async createWithSummary(req, res) {
    try {
      const data = req.body;
      const record = await Attendance_RecordModel.createWithSummary(data);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Update record
  static async update(req, res) {
    try {
      const id = req.params.id;
      const data = req.body;
      const record = await Attendance_RecordModel.update(id, data);
      if (!record) {
        res.status(404).json({ message: "Attendance record not found" });
      } else {
        res.status(200).json(record);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Update exit and summary
  static async updateExitWithSummary(req, res) {
    try {
      const id = req.params.id;
      const data = req.body;
      const record = await Attendance_RecordModel.updateExitWithSummary(id, data);
      if (!record) {
        res.status(404).json({ message: "Attendance record not found" });
      } else {
        res.status(200).json(record);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Delete (soft delete)
  static async delete(req, res) {
    try {
      const id = req.params.id;
      const deleted = await Attendance_RecordModel.delete(id);
      if (!deleted) {
        res.status(404).json({ message: "Attendance record not found" });
      } else {
        res.status(204).end();
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Get open record
  static async getOpenRecord(req, res) {
    try {
      const { userXPeriodId, date, mode } = req.query;
      const record = await Attendance_RecordModel.getOpenRecord(userXPeriodId, date, mode);
      if (!record) {
        res.status(404).json({ message: "No open record found" });
      } else {
        res.status(200).json(record);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Get completed virtual record
  static async getCompletedVirtualRecord(req, res) {
    try {
      const { userXPeriodId, date } = req.query;
      const record = await Attendance_RecordModel.getCompletedVirtualRecord(userXPeriodId, date);
      if (!record) {
        res.status(404).json({ message: "No completed virtual record found" });
      } else {
        res.status(200).json(record);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Get all open records with user info
  static async getOpenRecordsWithUser(req, res) {
    try {
      const records = await Attendance_RecordModel.getOpenRecordsWithUser();
      if (!records || records.length === 0) {
        res.status(404).json({ message: "No open records found" });
      } else {
        res.status(200).json(records);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Get all closed records
  static async getClosedRecords(req, res) {
    try {
      const records = await Attendance_RecordModel.getClosedRecords();
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Update closed record and adjust summary
  static async updateClosedWithSummary(req, res) {
    try {
      const id = req.params.id;
      const data = req.body;
      const record = await Attendance_RecordModel.updateClosedWithSummary(id, data);
      if (!record) {
        res.status(404).json({ message: "Closed record not found" });
      } else {
        res.status(200).json(record);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 🔹 Delete with summary adjustment
  static async deleteWithAdjustment(req, res) {
    try {
      const id = req.params.id;
      const result = await Attendance_RecordModel.deleteWithAdjustment(id);
      if (!result) {
        res.status(404).json({ message: "Record not found or could not be deleted" });
      } else {
        res.status(200).json({ message: "Record deleted and summary updated successfully" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
