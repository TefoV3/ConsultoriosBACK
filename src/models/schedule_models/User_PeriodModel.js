import { UserXPeriod } from "../../schemas/schedules_tables/UserXPeriod.js";
import { InternalUser } from "../../schemas/Internal_User.js";
import { Period } from "../../schemas/schedules_tables/Period.js";
import { AuditModel } from "../AuditModel.js";
import { sequelize } from "../../database/database.js";
import { getUserId } from "../../sessionData.js";

export class UserXPeriodModel {
  static async getAll() {
    try {
      return await UserXPeriod.findAll({
        where: { UserXPeriod_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error fetching UserXPeriod: ${error.message}`);
    }
  }

  static async getById(periodId, internalId) {
    try {
      return await UserXPeriod.findOne({
        where: { Period_ID: periodId, Internal_ID: internalId, UserXPeriod_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error fetching UserXPeriod: ${error.message}`);
    }
  }

  static async getAllWithUsersAndPeriods() {
    try {
      return await UserXPeriod.findAll({
        where: { UserXPeriod_IsDeleted: false },
        include: [
          {
            model: InternalUser,
            as: "user",
            attributes: [
              "Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email",
              "Internal_Phone", "Internal_Area", "Internal_Status", "Internal_Type", "Internal_Huella"
            ],
            where: { Internal_Status: "Activo" }
          },
          {
            model: Period,
            as: "period",
            attributes: ["Period_ID", "Period_Name"],
            where: { Period_IsDeleted: false }
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error fetching users with periods: ${error.message}`);
    }
  }

  static async getByInternalId(internalId) {
    try {
      return await UserXPeriod.findAll({
        where: { Internal_ID: internalId, UserXPeriod_IsDeleted: false },
        include: [
          {
            model: InternalUser,
            as: "user",
            attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"],
            where: { Internal_Status: "Activo" }
          },
          {
            model: Period,
            as: "period",
            attributes: ["Period_ID", "Period_Name", "Period_Start", "Period_End"],
            where: { Period_IsDeleted: false }
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error fetching user with periods: ${error.message}`);
    }
  }

  static async getByPeriod(periodId) {
    try {
      return await UserXPeriod.findAll({
        where: { Period_ID: periodId, UserXPeriod_IsDeleted: false },
        include: [
          {
            model: InternalUser,
            as: "user",
            attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"],
            where: { Internal_Status: "Activo" }
          },
          {
            model: Period,
            as: "period",
            attributes: ["Period_ID", "Period_Name"]
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error fetching users by period: ${error.message}`);
    }
  }

  static async getByPeriodAndInternalId(periodId, internalId) {
    try {
      return await UserXPeriod.findOne({
        where: { Period_ID: periodId, Internal_ID: internalId }
      });
    } catch (error) {
      throw new Error(`Error fetching UserXPeriod: ${error.message}`);
    }
  }

  static async getByPeriodAndArea(periodId, area) {
    try {
      return await UserXPeriod.findAll({
        where: { Period_ID: periodId, UserXPeriod_IsDeleted: false },
        include: [
          {
            model: InternalUser,
            as: "user",
            attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"],
            where: { Internal_Area: area }
          },
          {
            model: Period,
            as: "period",
            attributes: ["Period_ID", "Period_Name"]
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error fetching users by period and area: ${error.message}`);
    }
  }

  static async getByUserXPeriodId(id) {
    try {
      return await UserXPeriod.findOne({
        where: { UserXPeriod_ID: id, UserXPeriod_IsDeleted: false },
        include: [
          {
            model: InternalUser,
            as: "user",
            attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"],
            where: { Internal_Status: "Activo" }
          },
          {
            model: Period,
            as: "period",
            attributes: ["Period_ID", "Period_Name"],
            where: { Period_IsDeleted: false }
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error fetching UserXPeriod by ID: ${error.message}`);
    }
  }

  static async create(data, internalUser, options = {}) {
    const t = await sequelize.transaction(); // Start transaction
    try {
      const internalId = internalUser || getUserId();
      const entries = Array.isArray(data) ? data : [data];
      const toCreate = [];
      const reactivated = [];

      for (const entry of entries) {
        const existing = await this.getByPeriodAndInternalId(entry.Period_ID, entry.Internal_ID);
        if (existing) {
          if (existing.UserXPeriod_IsDeleted) {
            await UserXPeriod.update(
              { UserXPeriod_IsDeleted: false },
              { where: { Period_ID: entry.Period_ID, Internal_ID: entry.Internal_ID }, transaction: t }
            );
            const reloaded = await this.getByPeriodAndInternalId(entry.Period_ID, entry.Internal_ID);
            reactivated.push(reloaded);

            // Register audit for reactivation
            await AuditModel.registerAudit(
              internalId,
              "UPDATE",
              "UserXPeriod",
              `El usuario interno ${internalId} reactivó al usuario ${entry.Internal_ID} en el período ${entry.Period_ID}`
            );
          }
        } else {
          toCreate.push(entry);
        }
      }

      const created = toCreate.length > 0 ? await UserXPeriod.bulkCreate(toCreate, { ...options, transaction: t }) : [];

      // Register audit for new creations
      for (const createdEntry of created) {
        await AuditModel.registerAudit(
          internalId,
          "INSERT",
          "UserXPeriod",
          `El usuario interno ${internalId} agregó al usuario ${createdEntry.Internal_ID} al período ${createdEntry.Period_ID}`
        );
      }

      await t.commit(); // Commit transaction
      return [...reactivated, ...created];
    } catch (error) {
      await t.rollback(); // Rollback on error
      console.error("Error en UserXPeriodModel.create:", error);
      throw new Error(`Error creating UserXPeriod: ${error.message}`);
    }
  }

  static async update(periodId, internalId, data, internalUser) {
    const t = await sequelize.transaction(); // Start transaction
    try {
      const userId = internalUser || getUserId();
      const existing = await this.getById(periodId, internalId);
      if (!existing) {
        await t.rollback();
        return null;
      }

      const [updatedRows] = await UserXPeriod.update(data, {
        where: { Period_ID: periodId, Internal_ID: internalId, UserXPeriod_IsDeleted: false },
        transaction: t
      });

      if (updatedRows === 0) {
        await t.rollback();
        return null;
      }

      // Register audit
      await AuditModel.registerAudit(
        userId,
        "UPDATE",
        "UserXPeriod",
        `El usuario interno ${userId} actualizó la asignación del usuario ${internalId} en el período ${periodId}`
      );

      await t.commit(); // Commit transaction

      const newPeriodId = data.Period_ID || periodId;
      const newInternalId = data.Internal_ID || internalId;

      return await this.getById(newPeriodId, newInternalId);
    } catch (error) {
      await t.rollback(); // Rollback on error
      console.error("Error en UserXPeriodModel.update:", error);
      throw new Error(`Error updating UserXPeriod: ${error.message}`);
    }
  }

  static async delete(periodId, internalId, internalUser) {
    try {
      if (!periodId || !internalId) {
        throw new Error("The Period_ID and Internal_ID fields are required to delete a UserXPeriod");
      }

      const userId = internalUser || getUserId();
      const existing = await this.getById(periodId, internalId);
      if (!existing) return null;

      await UserXPeriod.update(
        { UserXPeriod_IsDeleted: true },
        { where: { Period_ID: periodId, Internal_ID: internalId, UserXPeriod_IsDeleted: false } }
      );

      await AuditModel.registerAudit(
        userId,
        "DELETE",
        "UserXPeriod",
        `El usuario interno ${userId} eliminó lógicamente al usuario ${internalId} del período ${periodId}`
      );

      return await UserXPeriod.findOne({ where: { Period_ID: periodId, Internal_ID: internalId } });
    } catch (error) {
      throw new Error(`Error deleting UserXPeriod: ${error.message}`);
    }
  }
}
