import { Extra_Hours } from "../../schemas/schedules_tables/Extra_Hours.js";
import { Student_Hours_SummaryModel } from "./Student_Hours_SummaryModel.js";
import { sequelize } from "../../database/database.js";

// Reusable constant
const MAX_HOURS = 500;

// ✅ Check if the total hours reach the max
function checkCompletionFields(newTotal) {
  const isComplete = parseFloat(newTotal) >= MAX_HOURS;
  return {
    Summary_IsComplete: isComplete,
    Summary_End: isComplete ? new Date() : null
  };
}

export class Extra_HoursModel {
  /** 🔹 Get all active extra hours */
  static async getAll() {
    try {
      return await Extra_Hours.findAll({
        where: { Hours_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error fetching extra hours: ${error.message}`);
    }
  }

  /** 🔹 Get one record by ID */
  static async getById(id) {
    try {
      return await Extra_Hours.findOne({
        where: { Hours_ID: id, Hours_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error fetching extra hour by ID: ${error.message}`);
    }
  }

  /** 🔹 Create a new record */
  static async create(data) {
    try {
      return await Extra_Hours.create(data);
    } catch (error) {
      throw new Error(`Error creating extra hour: ${error.message}`);
    }
  }

  /** 🔹 Update a record */
  static async update(id, data) {
    try {
      const record = await this.getById(id);
      if (!record) return null;

      const [updatedRows] = await Extra_Hours.update(data, {
        where: { Hours_ID: id, Hours_IsDeleted: false }
      });

      if (updatedRows === 0) return null;
      return await this.getById(id);
    } catch (error) {
      throw new Error(`Error updating extra hour: ${error.message}`);
    }
  }

  /** 🔹 Logical delete */
  static async delete(id) {
    try {
      const record = await this.getById(id);
      if (!record) return null;

      await Extra_Hours.update(
        { Hours_IsDeleted: true },
        { where: { Hours_ID: id, Hours_IsDeleted: false } }
      );

      return await Extra_Hours.findOne({ where: { Hours_ID: id } });
    } catch (error) {
      throw new Error(`Error deleting extra hour: ${error.message}`);
    }
  }

  /**
   * Create an extra hour record and update the student's summary.
   * It uses a transaction to ensure atomic consistency.
   */
  static async createWithSummary(data) {
    console.log("Creating adjustment:", data);
    const t = await sequelize.transaction();
    try {
      const adjustment = await Extra_Hours.create(data, { transaction: t });

      let add = 0, reduce = 0;
      if (data.Hours_Type?.toLowerCase() === "adicional") {
        add = parseFloat(data.Hours_Num);
      } else if (data.Hours_Type?.toLowerCase() === "reducida") {
        reduce = parseFloat(data.Hours_Num);
      }

      const summary = await Student_Hours_SummaryModel.getByUser(data.Internal_ID);

      if (summary) {
        const newAdd = parseFloat(summary.Summary_Extra_Hours) + add;
        const newReduce = parseFloat(summary.Summary_Reduced_Hours) + reduce;
        const newTotal = parseFloat(summary.Summary_Total_Hours) + add - reduce;

        if (newTotal < 0) {
          throw new Error("Cannot reduce more hours than the student has.");
        }

        const fields = checkCompletionFields(newTotal);

        console.log("Updating summary:", {
          Summary_Extra_Hours: newAdd,
          Summary_Reduced_Hours: newReduce,
          Summary_Total_Hours: newTotal,
          ...fields
        });

        await Student_Hours_SummaryModel.update(summary.Summary_ID, {
          Summary_Extra_Hours: newAdd,
          Summary_Reduced_Hours: newReduce,
          Summary_Total_Hours: newTotal,
          ...fields
        }, { transaction: t });
      } else {
        const initialTotal = add - reduce;
        if (initialTotal < 0) {
          throw new Error("Cannot reduce more hours than the student has.");
        }
        const fields = checkCompletionFields(initialTotal);


        await Student_Hours_SummaryModel.create({
          Internal_ID: data.Internal_ID,
          Summary_Start: data.Hours_Date,
          Summary_Extra_Hours: add,
          Summary_Reduced_Hours: reduce,
          Summary_Total_Hours: initialTotal,
          ...fields
        }, { transaction: t });
      }

      await t.commit();
      return adjustment;
    } catch (error) {
      await t.rollback();
      console.error("Error in createWithSummary:", error);
      throw new Error(`Error creating adjustment and updating summary: ${error.message}`);
    }
  }

  /** 🔹 Get all extra hours by user */
  static async getByUser(internalId) {
    try {
      return await Extra_Hours.findAll({
        where: { Internal_ID: internalId, Hours_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error fetching extra hours for user: ${error.message}`);
    }
  }
}
