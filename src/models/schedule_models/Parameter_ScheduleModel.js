import { Parameter_Schedule } from "../../schemas/schedules_tables/Parameter_Schedule.js";
import { sequelize } from "../../database/database.js";
import { QueryTypes } from "sequelize";

export class Parameter_ScheduleModel {
  // 1. Get all active records
  static async getAll() {
    try {
      return await Parameter_Schedule.findAll({
        where: { Parameter_Schedule_IsDeleted: false },
      });
    } catch (error) {
      throw new Error(`Error fetching parameters: ${error.message}`);
    }
  }

  // 2. Get by ID (if not deleted)
  static async getById(id) {
    try {
      return await Parameter_Schedule.findOne({
        where: {
          Parameter_Schedule_ID: id,
          Parameter_Schedule_IsDeleted: false,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching parameter: ${error.message}`);
    }
  }

  // 3. Get available slots by type (Temprano or Tarde)
  static async getAvailableByType(type, periodId, area, day) {
    try {
      const dayColumn = {
        Monday: "Schedule_Day_Monday",
        Tuesday: "Schedule_Day_Tuesday",
        Wednesday: "Schedule_Day_Wednesday",
        Thursday: "Schedule_Day_Thursday",
        Friday: "Schedule_Day_Friday",
      }[day];

      if (!dayColumn) throw new Error(`Invalid day: ${day}`);

      let query = `
        SELECT ps.Parameter_Schedule_ID,
               ps.Parameter_Schedule_Start_Time,
               ps.Parameter_Schedule_End_Time,
               ps.Parameter_Schedule_Type
        FROM Parameter_Schedules ps
        WHERE ps.Parameter_Schedule_IsDeleted = 0
          AND ps.Parameter_Schedule_Type = :type
      `;

      if (type === 'Temprano' || type === 'Tarde') {
        query += `
          AND (
            SELECT COUNT(DISTINCT s.UserXPeriod_ID)
            FROM ScheduleStudents s
            INNER JOIN UserXPeriods up ON s.UserXPeriod_ID = up.UserXPeriod_ID
            INNER JOIN Internal_Users u ON up.Internal_ID = u.Internal_ID
            WHERE up.Period_ID = :periodId
              AND u.Internal_Area = :area
              AND s.Schedule_IsDeleted = 0
              AND s.${dayColumn} IN (
                SELECT ps2.Parameter_Schedule_ID
                FROM Parameter_Schedules ps2
                WHERE ps2.Parameter_Schedule_Type = :type
                  AND ps2.Parameter_Schedule_IsDeleted = 0
              )
          ) < 7
        `;
      }

      return await sequelize.query(query, {
        replacements: { type, periodId, area },
        type: QueryTypes.SELECT,
      });
    } catch (error) {
      throw new Error(`Error fetching available schedules: ${error.message}`);
    }
  }

  // 4. Create new record
  static async create(data) {
    try {
      return await Parameter_Schedule.create(data);
    } catch (error) {
      throw new Error(`Error creating parameter: ${error.message}`);
    }
  }

  // 5. Update record
  static async update(id, data) {
    try {
      return await Parameter_Schedule.update(data, {
        where: { Parameter_Schedule_ID: id },
      });
    } catch (error) {
      throw new Error(`Error updating parameter: ${error.message}`);
    }
  }

  // 6. Soft delete
  static async delete(id) {
    try {
      return await Parameter_Schedule.update(
        { Parameter_Schedule_IsDeleted: true },
        { where: { Parameter_Schedule_ID: id } }
      );
    } catch (error) {
      throw new Error(`Error deleting parameter: ${error.message}`);
    }
  }
}
