import { UserXPeriodModel } from "../../models/schedule_models/User_PeriodModel.js";

export class UserXPeriodController {
  
  static async getAll(req, res) {
    try {
      const userPeriods = await UserXPeriodModel.getAll();
      res.json(userPeriods);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async getById(req, res) {
    const { periodId, internalId } = req.params;
    try {
      const userPeriod = await UserXPeriodModel.getById(periodId, internalId);
      if (userPeriod) return res.json(userPeriod);
      res.status(404).json({ message: "UserXPeriod not found" });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async getAllWithUsersAndPeriods(req, res) {
    try {
      const data = await UserXPeriodModel.getAllWithUsersAndPeriods();
      res.json(data);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async getByInternalId(req, res) {
    const { internalId } = req.params;
    try {
      const userPeriod = await UserXPeriodModel.getByInternalId(internalId);
      if (userPeriod) return res.json(userPeriod);
      res.status(404).json({ message: "UserXPeriod not found" });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async getByPeriod(req, res) {
    const { periodId } = req.params;
    try {
      const userPeriods = await UserXPeriodModel.getByPeriod(periodId);
      console.log(userPeriods);
      res.json(userPeriods);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async getByUserXPeriodId(req, res) {
    const { userXPeriodId } = req.params;
    try {
      const userPeriod = await UserXPeriodModel.getByUserXPeriodId(userXPeriodId);
      if (!userPeriod) {
        return res.status(404).json({ message: "UserXPeriod not found" });
      }
      return res.json(userPeriod);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getByPeriodAndInternalId(req, res) {
    const { periodId, internalId } = req.params;
    try {
      const userPeriod = await UserXPeriodModel.getByPeriodAndInternalId(periodId, internalId);
      if (userPeriod) return res.json(userPeriod);
      res.status(404).json({ message: "UserXPeriod not found" });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async getByPeriodAndArea(req, res) {
    const { periodId, area } = req.params;
    try {
      const users = await UserXPeriodModel.getByPeriodAndArea(periodId, area);
      if (users) return res.json(users);
      res.status(404).json({ message: "Users not found" });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async create(req, res) {
    try {
      const internalId = req.headers["internal-id"]; // Obtener el Internal_ID desde los encabezados
      const newRecord = await UserXPeriodModel.create(req.body, internalId); // Pasar el Internal_ID al modelo
      return res.status(201).json(newRecord);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { periodId, internalId } = req.params;
      const userId = req.headers["internal-id"]; // Obtener el Internal_ID desde los encabezados
      const updated = await UserXPeriodModel.update(periodId, internalId, req.body, userId); // Pasar el Internal_ID al modelo

      if (!updated) return res.status(404).json({ message: "UserXPeriod not found" });

      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { periodId, internalId } = req.params;
      const userId = req.headers["internal-id"]; // Obtener el Internal_ID desde los encabezados
      const deleted = await UserXPeriodModel.delete(periodId, internalId, userId); // Pasar el Internal_ID al modelo

      if (!deleted) return res.status(404).json({ message: "UserXPeriod not found" });
      return res.json({ message: "UserXPeriod logically deleted", userPeriod: deleted });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
