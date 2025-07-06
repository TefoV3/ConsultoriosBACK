import { Alert } from "../../schemas/schedules_tables/Alert.js";
import { sequelize } from "../../database/database.js";
import { AuditModel } from "../AuditModel.js";
import { getUserId } from "../../sessionData.js";

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
  static async create(data, options = {}) {
    const t = options.transaction || await sequelize.transaction();
    const shouldCommit = !options.transaction;
    
    try {
      const internalUser = options.internalUser || getUserId();
      const isAutomatic = options.isAutomatic || false;

      const newAlert = await Alert.create(data, { ...options, transaction: t });

      // Solo auditar si se requiere
      if (!options.skipAudit) {
        const creationType = isAutomatic ? 'automáticamente' : 'manualmente';
        const alertType = data.Alert_Type || 'Tipo no especificado';
        const targetUserId = data.Internal_ID || 'Usuario no especificado';
        
        // Register audit
        await AuditModel.registerAudit(
          internalUser,
          "INSERT",
          "Alert",
          `El usuario interno ${internalUser} creó ${creationType} una alerta ID ${newAlert.Alert_ID} para el usuario interno ${targetUserId} - Tipo: ${alertType}`
        );
      }

      if (shouldCommit) await t.commit();
      return newAlert;
    } catch (error) {
      if (shouldCommit) await t.rollback();
      console.error("Error en AlertModel.create:", error);
      throw new Error(`Error creating alert: ${error.message}`);
    }
  }

  // 4. Update alert
  static async update(id, data, options = {}) {
    const t = options.transaction || await sequelize.transaction();
    const shouldCommit = !options.transaction;
    
    try {
      const internalUser = options.internalUser || getUserId();
      const isAutomatic = options.isAutomatic || false;
      
      const alert = await this.getById(id);
      if (!alert) return null;

      const [updated] = await Alert.update(data, {
        where: { Alert_ID: id, Alert_IsDeleted: false },
        transaction: t,
      });

      if (updated > 0) {
        // Solo auditar si se requiere
        if (!options.skipAudit) {
          const updateType = isAutomatic ? 'automáticamente' : 'manualmente';
          const targetUserId = alert.Internal_ID || 'Usuario no especificado';
          
          // Register audit
          await AuditModel.registerAudit(
            internalUser,
            "UPDATE",
            "Alert",
            `El usuario interno ${internalUser} actualizó ${updateType} la alerta ID ${id} del usuario interno ${targetUserId}`
          );
        }

        if (shouldCommit) await t.commit();
        return await this.getById(id);
      } else {
        if (shouldCommit) await t.rollback();
        return null;
      }
    } catch (error) {
      if (shouldCommit) await t.rollback();
      console.error("Error en AlertModel.update:", error);
      throw new Error(`Error updating alert: ${error.message}`);
    }
  }

  // 5. Soft delete alert
  static async delete(id, options = {}) {
    const t = options.transaction || await sequelize.transaction();
    const shouldCommit = !options.transaction;
    
    try {
      const internalUser = options.internalUser || getUserId();
      const isAutomatic = options.isAutomatic || false;
      
      const alert = await this.getById(id);
      if (!alert) return null;

      await Alert.update(
        { Alert_IsDeleted: true },
        { 
          where: { Alert_ID: id, Alert_IsDeleted: false },
          transaction: t,
        }
      );

      // Solo auditar si se requiere
      if (!options.skipAudit) {
        const deleteType = isAutomatic ? 'automáticamente' : 'manualmente';
        const targetUserId = alert.Internal_ID || 'Usuario no especificado';
        const alertType = alert.Alert_Type || 'Tipo no especificado';
        
        // Register audit
        await AuditModel.registerAudit(
          internalUser,
          "DELETE",
          "Alert",
          `El usuario interno ${internalUser} eliminó ${deleteType} la alerta ID ${id} del usuario interno ${targetUserId} - Tipo: ${alertType}`
        );
      }

      if (shouldCommit) await t.commit();
      return alert;
    } catch (error) {
      if (shouldCommit) await t.rollback();
      console.error("Error en AlertModel.delete:", error);
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
