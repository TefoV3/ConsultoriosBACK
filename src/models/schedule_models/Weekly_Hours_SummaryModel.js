import { Weekly_Hours_Summary } from "../../schemas/schedules_tables/Weekly_Hours_Summary.js";
import { sequelize } from "../../database/database.js";
import { QueryTypes } from "sequelize";

export class Weekly_Hours_SummaryModel {
  // 🔹 Get all active weekly summaries
  static async getAll() {
    try {
      return await Weekly_Hours_Summary.findAll({
        where: { Hours_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error fetching weekly summaries: ${error.message}`);
    }
  }

  // 🔹 Get one weekly summary by ID
  static async getById(id) {
    try {
      return await Weekly_Hours_Summary.findOne({
        where: { WeeklySummary_ID: id, Hours_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error fetching weekly summary by ID: ${error.message}`);
    }
  }

  // 🔹 Get weekly summaries by general summary ID (JOIN with Weekly_Tracking and Period)
  static async getByGeneralSummaryId(generalSummaryId) {
    try {
      const query = `
        SELECT 
          whs.WeeklySummary_ID,
          whs.Summary_ID,
          whs.Week_Number,
          whs.Week_Start,
          whs.Week_End,
          whs.Attendance_Hours,
          p.Period_Name
        FROM Weekly_Hours_Summaries whs
        JOIN Weekly_Tracking wt 
          ON whs.Week_Number = wt.Week_Number
          AND whs.Week_Start = wt.Week_Start
          AND whs.Week_End = wt.Week_End
        JOIN Periods p ON p.Period_ID = wt.Period_ID
        WHERE whs.Summary_ID = :generalSummaryId
          AND whs.Hours_IsDeleted = false
          AND wt.Week_IsDeleted = false
          AND p.Period_IsDeleted = false
        ORDER BY whs.Week_Start ASC;
      `;

      return await sequelize.query(query, {
        replacements: { generalSummaryId },
        type: QueryTypes.SELECT
      });
    } catch (error) {
      console.error("Error in getByGeneralSummaryId:", error);
      throw new Error(`Error fetching weekly summaries: ${error.message}`);
    }
  }

  // 🔹 Create a new weekly summary
  static async create(data) {
    try {
      return await Weekly_Hours_Summary.create(data);
    } catch (error) {
      throw new Error(`Error creating weekly summary: ${error.message}`);
    }
  }

  // 🔹 Update a weekly summary by WeeklySummary_ID
  static async update(id, data) {
    try {
      const [rowsUpdated] = await Weekly_Hours_Summary.update(data, {
        where: { WeeklySummary_ID: id, Hours_IsDeleted: false }
      });
      if (rowsUpdated === 0) return null;
      return await this.getById(id);
    } catch (error) {
      throw new Error(`Error updating weekly summary: ${error.message}`);
    }
  }

  // 🔹 Logical delete
  static async delete(id) {
    try {
      const [rowsUpdated] = await Weekly_Hours_Summary.update(
        { Hours_IsDeleted: true },
        { where: { WeeklySummary_ID: id, Hours_IsDeleted: false } }
      );
      return rowsUpdated > 0;
    } catch (error) {
      throw new Error(`Error deleting weekly summary: ${error.message}`);
    }
  }
}
