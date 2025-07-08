import { Period } from "../../schemas/schedules_tables/Period.js";
import { Weekly_Tracking } from "../../schemas/schedules_tables/Weekly_Tracking.js";
import { InternalUser } from "../../schemas/Internal_User.js";
import { AuditModel } from "../AuditModel.js";
import { sequelize } from "../../database/database.js";
import { Op } from "sequelize";
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

export class PeriodModel {
  /** 🔹 Get all active periods */
  static async getPeriods() {
    try {
      return await Period.findAll({ where: { Period_IsDeleted: false } });
    } catch (error) {
      throw new Error(`Error fetching periods: ${error.message}`);
    }
  }

  /** 🔹 Get period by ID if not deleted */
  static async getById(id) {
    try {
      return await Period.findOne({
        where: { Period_ID: id, Period_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error fetching period: ${error.message}`);
    }
  }

  /** 🔹 Get period along with associated weekly tracking data */
  static async getPeriodWithTracking(periodId) {
    try {
      return await Period.findOne({
        where: { Period_ID: periodId, Period_IsDeleted: false },
        include: [
          {
            model: Weekly_Tracking,
            as: "trackings",
            where: { Week_IsDeleted: false },
            required: false
          }
        ]
      });
    } catch (error) {
      console.log(`Error fetching period with tracking: ${error.message}`);
      throw new Error(`Error fetching period with tracking: ${error.message}`);
    }
  }

  /** 🔹 Create a new period */
  static async create(data, internalUser) {
    const t = await sequelize.transaction(); // Start transaction
    try {
      const internalId = internalUser || getUserId();

      const conflict = await Period.findOne({
        where: {
          Period_IsDeleted: false,
          [Op.or]: [
            { Period_Start: { [Op.between]: [data.Period_Start, data.Period_End] } },
            { Period_End: { [Op.between]: [data.Period_Start, data.Period_End] } },
            {
              Period_Start: { [Op.lte]: data.Period_Start },
              Period_End: { [Op.gte]: data.Period_End }
            }
          ]
        },
        transaction: t
      });

      if (conflict) {
        await t.rollback();
        throw new Error("A period overlapping the given dates already exists.");
      }

      const newPeriod = await Period.create(data, { transaction: t });

      // Get admin user information for audit
      let adminInfo = { name: 'Usuario Desconocido', area: 'Área no especificada' };
      try {
        const admin = await InternalUser.findOne({
          where: { Internal_ID: internalId },
          attributes: ["Internal_Name", "Internal_LastName", "Internal_Area"]
        });
        
        if (admin) {
          adminInfo = {
            name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
            area: admin.Internal_Area || 'Área no especificada'
          };
        }
      } catch (err) {
        console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
      }

      const startDate = data.Period_Start ? new Date(data.Period_Start).toLocaleDateString('es-ES') : 'Sin fecha';
      const endDate = data.Period_End ? new Date(data.Period_End).toLocaleDateString('es-ES') : 'Sin fecha';
      const periodName = data.Period_Name || 'Sin nombre';
      const status = data.Period_Status || 'Sin estado';

      // Get user information for audit
      const userInfo = await getUserInfo(internalId);

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "INSERT",
        "Period",
        `${userInfo} creó el período "${periodName}" ID ${newPeriod.Period_ID} - Fechas: ${startDate} a ${endDate}, Estado: ${status}`
      );

      await t.commit(); // Commit transaction
      return newPeriod;
    } catch (error) {
      await t.rollback(); // Rollback on error
      console.error("Error en PeriodModel.create:", error);
      throw new Error(`Error creating period: ${error.message}`);
    }
  }

  /** 🔹 Update an existing period (avoid overlapping with others) */
  static async update(id, data, internalUser) {
    const t = await sequelize.transaction(); // Start transaction
    try {
      const internalId = internalUser || getUserId();
      const current = await this.getById(id);
      if (!current) {
        await t.rollback();
        return null;
      }

      const conflict = await Period.findOne({
        where: {
          Period_ID: { [Op.ne]: id },
          Period_IsDeleted: false,
          [Op.or]: [
            { Period_Start: { [Op.between]: [data.Period_Start, data.Period_End] } },
            { Period_End: { [Op.between]: [data.Period_Start, data.Period_End] } },
            {
              Period_Start: { [Op.lte]: data.Period_Start },
              Period_End: { [Op.gte]: data.Period_End }
            }
          ]
        },
        transaction: t
      });

      if (conflict) {
        await t.rollback();
        throw new Error("Another period overlapping the given dates already exists.");
      }

      const [rowsUpdated] = await Period.update(data, {
        where: { Period_ID: id, Period_IsDeleted: false },
        transaction: t
      });

      // Get admin user information for audit
      let adminInfo = { name: 'Usuario Desconocido', area: 'Área no especificada' };
      try {
        const admin = await InternalUser.findOne({
          where: { Internal_ID: internalId },
          attributes: ["Internal_Name", "Internal_LastName", "Internal_Area"]
        });
        
        if (admin) {
          adminInfo = {
            name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
            area: admin.Internal_Area || 'Área no especificada'
          };
        }
      } catch (err) {
        console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
      }

      // Build change description
      let changeDetails = [];
      
      if (data.Period_Name && data.Period_Name !== current.Period_Name) {
        changeDetails.push(`Nombre: "${current.Period_Name}" → "${data.Period_Name}"`);
      }

      if (data.Period_Start) {
        const oldStart = current.Period_Start ? new Date(current.Period_Start).toLocaleDateString('es-ES') : 'Sin fecha';
        const newStart = new Date(data.Period_Start).toLocaleDateString('es-ES');
        if (oldStart !== newStart) {
          changeDetails.push(`Fecha inicio: ${oldStart} → ${newStart}`);
        }
      }

      if (data.Period_End) {
        const oldEnd = current.Period_End ? new Date(current.Period_End).toLocaleDateString('es-ES') : 'Sin fecha';
        const newEnd = new Date(data.Period_End).toLocaleDateString('es-ES');
        if (oldEnd !== newEnd) {
          changeDetails.push(`Fecha fin: ${oldEnd} → ${newEnd}`);
        }
      }

      if (data.Period_Status && data.Period_Status !== current.Period_Status) {
        changeDetails.push(`Estado: "${current.Period_Status}" → "${data.Period_Status}"`);
      }

      const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : ' - Sin cambios detectados';
      const periodName = current.Period_Name || `ID ${id}`;

      // Get user information for audit
      const userInfo = await getUserInfo(internalId);

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "UPDATE",
        "Period",
        `${userInfo} modificó el período "${periodName}"${changeDescription}`
      );

      if (rowsUpdated === 0) {
        console.warn(`[Period Update] No rows updated for Period_ID: ${id}. Data might be identical or period deleted.`);
      }

      await t.commit(); // Commit transaction

      // Fetch the potentially updated period outside the transaction
      return await this.getById(id);
    } catch (error) {
      await t.rollback(); // Rollback on error
      console.error("Error en PeriodModel.update:", error);
      throw new Error(`Error updating period: ${error.message}`);
    }
  }

  /** 🔹 Soft-delete period */
  static async delete(id, internalUser) {
    try {
      if (!id) {
        throw new Error("The Period_ID field is required to delete a period");
      }

      const internalId = internalUser || getUserId();
      const period = await this.getById(id);
      if (!period) return null;

      await Period.update(
        { Period_IsDeleted: true },
        { where: { Period_ID: id, Period_IsDeleted: false } }
      );

      // Get admin user information for audit
      let adminInfo = { name: 'Usuario Desconocido', area: 'Área no especificada' };
      try {
        const admin = await InternalUser.findOne({
          where: { Internal_ID: internalId },
          attributes: ["Internal_Name", "Internal_LastName", "Internal_Area"]
        });
        
        if (admin) {
          adminInfo = {
            name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
            area: admin.Internal_Area || 'Área no especificada'
          };
        }
      } catch (err) {
        console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
      }

      const periodName = period.Period_Name || `ID ${id}`;
      const startDate = period.Period_Start ? new Date(period.Period_Start).toLocaleDateString('es-ES') : 'Sin fecha';
      const endDate = period.Period_End ? new Date(period.Period_End).toLocaleDateString('es-ES') : 'Sin fecha';
      const status = period.Period_Status || 'Sin estado';

      // Get user information for audit
      const userInfo = await getUserInfo(internalId);

      await AuditModel.registerAudit(
        internalId,
        "DELETE",
        "Period",
        `${userInfo} eliminó el período "${periodName}" - Fechas: ${startDate} a ${endDate}, Estado: ${status}`
      );

      return period;
    } catch (error) {
      throw new Error(`Error deleting period: ${error.message}`);
    }
  }
}
