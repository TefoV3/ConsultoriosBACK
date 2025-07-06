import { Period } from "../../schemas/schedules_tables/Period.js";
import { Weekly_Tracking } from "../../schemas/schedules_tables/Weekly_Tracking.js";
import { AuditModel } from "../AuditModel.js";
import { sequelize } from "../../database/database.js";
import { Op } from "sequelize";
import { getUserId } from "../../sessionData.js"; // Adjust the import path as necessary

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

      // Register audit
      await AuditModel.registerAudit(
        internalId,
        "INSERT",
        "Period",
        `El usuario interno ${internalId} creó el período ${newPeriod.Period_ID}`
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

      // Register audit
      await AuditModel.registerAudit(
        internalId,
        "UPDATE",
        "Period",
        `El usuario interno ${internalId} actualizó el período ${id}`
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

      await AuditModel.registerAudit(
        internalId,
        "DELETE",
        "Period",
        `El usuario interno ${internalId} eliminó lógicamente el período ${id}`
      );

      return period;
    } catch (error) {
      throw new Error(`Error deleting period: ${error.message}`);
    }
  }
}
