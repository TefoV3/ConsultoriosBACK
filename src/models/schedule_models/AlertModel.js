import { Alert } from "../../schemas/schedules_tables/Alert.js";

export class AlertModel {
  // 1. Get all active alerts
  static async getAll() {
    try {
      return await Alert.findAll({ where: { Alert_IsDeleted: false } });
    } catch (error) {
      throw new Error(`Error fetching alerts: ${error.message}`);
    }
  }

  // 2. Get alert by ID
  static async getById(id) {
    try {
      return await Alert.findOne({
        where: { Alert_ID: id, Alert_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error fetching alert: ${error.message}`);
    }
  }

  // 3. Create new alert
  static async create(data) {
    try {
      return await Alert.create(data);
    } catch (error) {
      throw new Error(`Error creating alert: ${error.message}`);
    }
  }

  // 4. Update alert
  static async update(id, data) {
    try {
      const alert = await this.getById(id);
      if (!alert) return null;

      const [updated] = await Alert.update(data, {
        where: { Alert_ID: id, Alert_IsDeleted: false }
      });

      return updated > 0 ? await this.getById(id) : null;
    } catch (error) {
      throw new Error(`Error updating alert: ${error.message}`);
    }
  }

  // 5. Soft delete alert
  static async delete(id) {
    try {
      const alert = await this.getById(id);
      if (!alert) return null;

      await Alert.update(
        { Alert_IsDeleted: true },
        { where: { Alert_ID: id, Alert_IsDeleted: false } }
      );

      return alert;
    } catch (error) {
      throw new Error(`Error deleting alert: ${error.message}`);
    }
  }

  //get Alerts by Internal_ID
  static async getByInternalId(internalId) {
    try {
      return await Alert.findAll({
        where: { Internal_ID: internalId, Alert_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error fetching alerts by Internal_ID: ${error.message}`);
    }
  }
}
