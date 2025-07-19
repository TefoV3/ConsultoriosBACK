import { Alert } from "../../schemas/schedules_tables/Alert.js";
import { InternalUser } from "../../schemas/Internal_User.js";
import { sequelize } from "../../database/database.js";
import { AuditModel } from "../AuditModel.js";
import { getUserId } from "../../sessionData.js";

// Helper function to get user information for audit
async function getUserInfo(internalId) {
  try {
    const admin = await InternalUser.findOne({
      where: { Internal_ID: internalId },
      attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
    });
    
    if (admin) {
      return `${admin.Internal_Name} ${admin.Internal_LastName} (${admin.Internal_Type || 'Sin rol'} - ${admin.Internal_Area || 'Sin área'})`;
    }
    return `Usuario ID ${internalId} (Información no disponible)`;
  } catch (err) {
    console.warn("No se pudo obtener información del usuario para auditoría:", err.message);
    return `Usuario ID ${internalId} (Error al obtener información)`;
  }
}

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
        // Get user information for audit
        const userInfo = await getUserInfo(internalUser);

        // Get target user information for audit
        let targetInfo = { name: 'Usuario Desconocido', area: 'Área no especificada', id: data.Internal_ID || 'Desconocido' };
        if (data.Internal_ID) {
          try {
            const targetUser = await InternalUser.findOne({
              where: { Internal_ID: data.Internal_ID },
              attributes: ["Internal_Name", "Internal_LastName", "Internal_Area"]
            });
            
            if (targetUser) {
              targetInfo = {
                name: `${targetUser.Internal_Name} ${targetUser.Internal_LastName}`,
                area: targetUser.Internal_Area || 'Área no especificada',
                id: data.Internal_ID
              };
            }
          } catch (err) {
            console.warn("No se pudo obtener información del usuario objetivo para auditoría:", err.message);
          }
        }

        const creationType = isAutomatic ? 'automáticamente' : 'manualmente';
        const alertType = data.Alert_Type || 'Tipo no especificado';
        const alertMessage = data.Alert_Message ? data.Alert_Message.substring(0, 100) + (data.Alert_Message.length > 100 ? '...' : '') : 'Sin mensaje';
        
        // Register detailed audit
        await AuditModel.registerAudit(
          internalUser,
          "INSERT",
          "Alert",
          `${userInfo} creó ${creationType} una alerta ID ${newAlert.Alert_ID} para ${targetInfo.name} (Cédula: ${targetInfo.id}, Área: ${targetInfo.area}) - Tipo: ${alertType}, Mensaje: "${alertMessage}"`
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
          // Get user information for audit
          const userInfo = await getUserInfo(internalUser);

          // Get target user information for audit
          let targetInfo = { name: 'Usuario Desconocido', area: 'Área no especificada', id: alert.Internal_ID || 'Desconocido' };
          if (alert.Internal_ID) {
            try {
              const targetUser = await InternalUser.findOne({
                where: { Internal_ID: alert.Internal_ID },
                attributes: ["Internal_Name", "Internal_LastName", "Internal_Area"]
              });
              
              if (targetUser) {
                targetInfo = {
                  name: `${targetUser.Internal_Name} ${targetUser.Internal_LastName}`,
                  area: targetUser.Internal_Area || 'Área no especificada',
                  id: alert.Internal_ID
                };
              }
            } catch (err) {
              console.warn("No se pudo obtener información del usuario objetivo para auditoría:", err.message);
            }
          }

          // Build change description
          let changeDetails = [];
          
          if (data.Alert_Type && data.Alert_Type !== alert.Alert_Type) {
            changeDetails.push(`Tipo: "${alert.Alert_Type}" → "${data.Alert_Type}"`);
          }

          if (data.Alert_Message && data.Alert_Message !== alert.Alert_Message) {
            const oldMsg = alert.Alert_Message ? alert.Alert_Message.substring(0, 50) + '...' : 'Sin mensaje';
            const newMsg = data.Alert_Message.substring(0, 50) + '...';
            changeDetails.push(`Mensaje: "${oldMsg}" → "${newMsg}"`);
          }

          if (data.Alert_Status && data.Alert_Status !== alert.Alert_Status) {
            changeDetails.push(`Estado: "${alert.Alert_Status || 'Sin estado'}" → "${data.Alert_Status}"`);
          }

          const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : '';
          const updateType = isAutomatic ? 'automáticamente' : 'manualmente';
          
          // Register detailed audit
          await AuditModel.registerAudit(
            internalUser,
            "UPDATE",
            "Alert",
            `${userInfo} actualizó ${updateType} la alerta ID ${id} de ${targetInfo.name} (Cédula: ${targetInfo.id}, Área: ${targetInfo.area})${changeDescription}`
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
        // Get user information for audit
        const userInfo = await getUserInfo(internalUser);

        // Get target user information for audit
        let targetInfo = { name: 'Usuario Desconocido', area: 'Área no especificada', id: alert.Internal_ID || 'Desconocido' };
        if (alert.Internal_ID) {
          try {
            const targetUser = await InternalUser.findOne({
              where: { Internal_ID: alert.Internal_ID },
              attributes: ["Internal_Name", "Internal_LastName", "Internal_Area"]
            });
            
            if (targetUser) {
              targetInfo = {
                name: `${targetUser.Internal_Name} ${targetUser.Internal_LastName}`,
                area: targetUser.Internal_Area || 'Área no especificada',
                id: alert.Internal_ID
              };
            }
          } catch (err) {
            console.warn("No se pudo obtener información del usuario objetivo para auditoría:", err.message);
          }
        }

        const deleteType = isAutomatic ? 'automáticamente' : 'manualmente';
        const alertType = alert.Alert_Type || 'Tipo no especificado';
        const alertMessage = alert.Alert_Message ? alert.Alert_Message.substring(0, 100) + (alert.Alert_Message.length > 100 ? '...' : '') : 'Sin mensaje';
        
        // Register detailed audit
        await AuditModel.registerAudit(
          internalUser,
          "DELETE",
          "Alert",
          `${userInfo} eliminó ${deleteType} la alerta ID ${id} de ${targetInfo.name} (Cédula: ${targetInfo.id}, Área: ${targetInfo.area}) - Tipo: ${alertType}, Mensaje: "${alertMessage}"`
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
