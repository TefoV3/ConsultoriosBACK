import { InternalUser } from "../../schemas/Internal_User.js";
import { Student_Hours_Summary } from "../../schemas/schedules_tables/Student_Hours_Summary.js";

export class Student_Hours_SummaryModel {
  static async getAll() {
    try {
      return await Student_Hours_Summary.findAll({
        where: { Hours_IsDeleted: false },
      });
    } catch (error) {
      throw new Error(`Error fetching student summaries: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      return await Student_Hours_Summary.findOne({
        where: { Summary_ID: id, Hours_IsDeleted: false },
      });
    } catch (error) {
      throw new Error(`Error fetching student summary by ID: ${error.message}`);
    }
  }

  static async create(data, options = {}) {
    try {
      return await Student_Hours_Summary.create(data, options);
    } catch (error) {
      throw new Error(`Error creating student summary: ${error.message}`);
    }
  }

  static async update(id, data, options = {}) {
    try {
      const exists = await this.getById(id, options);
      if (!exists) return null;

      const [updated] = await Student_Hours_Summary.update(data, {
        where: { Summary_ID: id, Hours_IsDeleted: false },
        ...options,
      });

      return updated === 0 ? null : await this.getById(id, options);
    } catch (error) {
      throw new Error(`Error updating student summary: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const exists = await this.getById(id);
      if (!exists) return null;

      await Student_Hours_Summary.update(
        { Hours_IsDeleted: true },
        { where: { Summary_ID: id, Hours_IsDeleted: false } }
      );

      return await Student_Hours_Summary.findOne({ where: { Summary_ID: id } });
    } catch (error) {
      throw new Error(`Error deleting student summary: ${error.message}`);
    }
  }

  static async getAllWithStudents() {
    try {
      return await Student_Hours_Summary.findAll({
        where: { Hours_IsDeleted: false },
        include: [
          {
            model: InternalUser,
            as: "userSummary",
            attributes: [
              "Internal_ID",
              "Internal_Name",
              "Internal_LastName",
              "Internal_Area",
              "Internal_Email",
            ],
            where: { Internal_Status: "Activo" },
          },
        ],
      });
    } catch (error) {
      throw new Error(`Error fetching all summaries with students: ${error.message}`);
    }
  }

  static async getByCedula(internalId) {
    try {
      return await Student_Hours_Summary.findOne({
        where: { Hours_IsDeleted: false, Internal_ID: internalId },
        include: [
          {
            model: InternalUser,
            as: "userSummary",
            attributes: [
              "Internal_ID",
              "Internal_Name",
              "Internal_LastName",
              "Internal_Area",
              "Internal_Email",
            ],
            where: { Internal_Status: "Activo" },
          },
        ],
      });
    } catch (error) {
      throw new Error(`Error fetching summary by cedula: ${error.message}`);
    }
  }

  static async getWithUserDetails(id) {
    try {
      return await Student_Hours_Summary.findOne({
        where: { Internal_ID: id, Hours_IsDeleted: false },
        include: [
          {
            model: InternalUser,
            as: "userSummary",
            attributes: [
              "Internal_ID",
              "Internal_Name",
              "Internal_LastName",
              "Internal_Area",
              "Internal_Email",
            ],
            where: { Internal_Status: "Activo" },
          },
        ],
      });
    } catch (error) {
      throw new Error(`Error fetching user summary with details: ${error.message}`);
    }
  }

  static async getByUser(id) {
    try {
      return await Student_Hours_Summary.findOne({
        where: { Internal_ID: id, Hours_IsDeleted: false },
      });
    } catch (error) {
      throw new Error(`Error fetching summary by user: ${error.message}`);
    }
  }
}
