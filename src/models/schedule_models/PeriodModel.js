import { Period } from "../../schemas/schedules_tables/Period.js";
import { Weekly_Tracking } from "../../schemas/schedules_tables/Weekly_Tracking.js";
import { Op } from "sequelize";

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
  static async create(data) {
    try {
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
        }
      });

      if (conflict) {
        throw new Error("A period overlapping the given dates already exists.");
      }

      return await Period.create(data);
    } catch (error) {
      throw new Error(`Error creating period: ${error.message}`);
    }
  }

  /** 🔹 Update an existing period (avoid overlapping with others) */
  static async update(id, data) {
    try {
      const current = await this.getById(id);
      if (!current) return null;

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
        }
      });

      if (conflict) {
        throw new Error("Another period overlapping the given dates already exists.");
      }

      const [updated] = await Period.update(data, {
        where: { Period_ID: id, Period_IsDeleted: false }
      });

      if (updated === 0) return null;
      return await this.getById(id);
    } catch (error) {
      throw new Error(`Error updating period: ${error.message}`);
    }
  }

  /** 🔹 Soft-delete period */
  static async delete(id) {
    try {
      const period = await this.getById(id);
      if (!period) return null;

      await Period.update(
        { Period_IsDeleted: true },
        { where: { Period_ID: id, Period_IsDeleted: false } }
      );

      return await Period.findOne({ where: { Period_ID: id } });
    } catch (error) {
      throw new Error(`Error deleting period: ${error.message}`);
    }
  }
}
