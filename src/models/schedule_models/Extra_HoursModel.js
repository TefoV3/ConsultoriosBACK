import { Extra_Hours } from "../../schemas/schedules_tables/Extra_Hours.js";
import { Student_Hours_SummaryModel } from "./Student_Hours_SummaryModel.js";
import { sequelize } from "../../database/database.js";
import { AuditModel } from "../AuditModel.js";
import { getUserId } from "../../sessionData.js";
import { InternalUser } from "../../schemas/Internal_User.js";

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
  static async create(data, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      
      const newRecord = await Extra_Hours.create(data, { transaction: t });

      // Get student information for audit
      const student = await InternalUser.findOne({
        where: { Internal_ID: data.Internal_ID },
        attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Area"]
      });

      const studentName = student ? 
        `${student.Internal_Name} ${student.Internal_LastName}` : 
        'Usuario Desconocido';
      const studentArea = student?.Internal_Area || 'Área no especificada';
      const hoursDate = data.Hours_Date ? new Date(data.Hours_Date).toLocaleString('es-ES') : 'Sin fecha';
      const hoursType = data.Hours_Type || 'No especificado';
      const hoursNum = data.Hours_Num || 0;
      const hoursReason = data.Hours_Comment || 'Sin razón especificada';

      // Get user information for audit
      const userInfo = await getUserInfo(internalId);

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "INSERT",
        "Extra_Hours",
        `${userInfo} creó un ajuste de horas extra ID ${newRecord.Hours_ID} para el estudiante ${studentName} (Cédula: ${data.Internal_ID}, Área: ${studentArea}) - Fecha: ${hoursDate}, Tipo: ${hoursType}, Cantidad: ${hoursNum} horas, Motivo: ${hoursReason}`
      );

      await t.commit();
      return newRecord;
    } catch (error) {
      await t.rollback();
      console.error("Error en Extra_HoursModel.create:", error);
      throw new Error(`Error creating extra hour: ${error.message}`);
    }
  }

  /** 🔹 Update a record */
  static async update(id, data, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      const record = await this.getById(id);
      if (!record) return null;

      const [updatedRows] = await Extra_Hours.update(data, {
        where: { Hours_ID: id, Hours_IsDeleted: false },
        transaction: t
      });

      if (updatedRows === 0) {
        await t.rollback();
        return null;
      }

      // Get student information for audit
      const student = await InternalUser.findOne({
        where: { Internal_ID: record.Internal_ID },
        attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Area"]
      });

      const studentName = student ? 
        `${student.Internal_Name} ${student.Internal_LastName}` : 
        'Usuario Desconocido';
      const studentArea = student?.Internal_Area || 'Área no especificada';
      const hoursDate = record.Hours_Date ? new Date(record.Hours_Date).toLocaleString('es-ES') : 'Sin fecha';
      const hoursType = record.Hours_Type || 'No especificado';
      const hoursNum = record.Hours_Num || 0;

      // Get user information for audit
      const userInfo = await getUserInfo(internalId);

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "UPDATE",
        "Extra_Hours",
        `${userInfo} modificó el ajuste de horas extra ID ${id} del estudiante ${studentName} (Cédula: ${record.Internal_ID}, Área: ${studentArea}) - Fecha: ${hoursDate}, Tipo: ${hoursType}, Cantidad: ${hoursNum} horas`
      );

      await t.commit();
      return await this.getById(id);
    } catch (error) {
      await t.rollback();
      console.error("Error en Extra_HoursModel.update:", error);
      throw new Error(`Error updating extra hour: ${error.message}`);
    }
  }

  /** 🔹 Logical delete */
  static async delete(id, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      const record = await this.getById(id);
      if (!record) return null;

      await Extra_Hours.update(
        { Hours_IsDeleted: true },
        { 
          where: { Hours_ID: id, Hours_IsDeleted: false },
          transaction: t
        }
      );

      // Get student information for audit
      const student = await InternalUser.findOne({
        where: { Internal_ID: record.Internal_ID },
        attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Area"]
      });

      const studentName = student ? 
        `${student.Internal_Name} ${student.Internal_LastName}` : 
        'Usuario Desconocido';
      const studentArea = student?.Internal_Area || 'Área no especificada';
      const hoursDate = record.Hours_Date ? new Date(record.Hours_Date).toLocaleString('es-ES') : 'Sin fecha';
      const hoursType = record.Hours_Type || 'No especificado';
      const hoursNum = record.Hours_Num || 0;
      const hoursReason = record.Hours_Comment || 'Sin razón especificada';

      // Get user information for audit
      const userInfo = await getUserInfo(internalId);

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "DELETE",
        "Extra_Hours",
        `${userInfo} eliminó el ajuste de horas extra ID ${id} del estudiante ${studentName} (Cédula: ${record.Internal_ID}, Área: ${studentArea}) - Fecha: ${hoursDate}, Tipo: ${hoursType}, Cantidad: ${hoursNum} horas, Motivo: ${hoursReason}`
      );

      await t.commit();
      return await Extra_Hours.findOne({ where: { Hours_ID: id } });
    } catch (error) {
      await t.rollback();
      console.error("Error en Extra_HoursModel.delete:", error);
      throw new Error(`Error deleting extra hour: ${error.message}`);
    }
  }

  /**
   * Create an extra hour record and update the student's summary.
   * It uses a transaction to ensure atomic consistency.
   */
  static async createWithSummary(data, internalUser) {
    console.log("Creating adjustment:", data);
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      
      const adjustment = await Extra_Hours.create(data, { transaction: t });

      let add = 0, reduce = 0;
      if (data.Hours_Type?.toLowerCase() === "adicional") {
        add = parseFloat(data.Hours_Num);
      } else if (data.Hours_Type?.toLowerCase() === "reducida") {
        reduce = parseFloat(data.Hours_Num);
      }

      const summary = await Student_Hours_SummaryModel.getByUser(data.Internal_ID);
      
      // Get student information for audit
      const student = await InternalUser.findOne({
        where: { Internal_ID: data.Internal_ID },
        attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Area"]
      });

      const studentName = student ? 
        `${student.Internal_Name} ${student.Internal_LastName}` : 
        'Usuario Desconocido';
      const studentArea = student?.Internal_Area || 'Área no especificada';
      const hoursDate = data.Hours_Date ? new Date(data.Hours_Date).toLocaleString('es-ES') : 'Sin fecha';
      const hoursType = data.Hours_Type || 'No especificado';
      const hoursNum = data.Hours_Num || 0;
      const hoursReason = data.Hours_Comment || 'Sin razón especificada';

      let previousTotalHours = 0;
      let newTotalHours = 0;

      if (summary) {
        previousTotalHours = parseFloat(summary.Summary_Total_Hours);
        const newAdd = parseFloat(summary.Summary_Extra_Hours) + add;
        const newReduce = parseFloat(summary.Summary_Reduced_Hours) + reduce;
        newTotalHours = previousTotalHours + add - reduce;

        if (newTotalHours < 0) {
          throw new Error("Cannot reduce more hours than the student has.");
        }

        const fields = checkCompletionFields(newTotalHours);

        console.log("Updating summary:", {
          Summary_Extra_Hours: newAdd,
          Summary_Reduced_Hours: newReduce,
          Summary_Total_Hours: newTotalHours,
          ...fields
        });

        await Student_Hours_SummaryModel.update(summary.Summary_ID, {
          Summary_Extra_Hours: newAdd,
          Summary_Reduced_Hours: newReduce,
          Summary_Total_Hours: newTotalHours,
          ...fields
        }, { transaction: t });
      } else {
        newTotalHours = add - reduce;
        if (newTotalHours < 0) {
          throw new Error("Cannot reduce more hours than the student has.");
        }
        const fields = checkCompletionFields(newTotalHours);

        await Student_Hours_SummaryModel.create({
          Internal_ID: data.Internal_ID,
          Summary_Start: data.Hours_Date,
          Summary_Extra_Hours: add,
          Summary_Reduced_Hours: reduce,
          Summary_Total_Hours: newTotalHours,
          ...fields
        }, { transaction: t });
      }

      // Register detailed audit with summary update information
      const actionType = hoursType.toLowerCase() === "adicional" ? "agregó" : "redujo";
      const summaryInfo = summary ? 
        `Total de horas actualizado: ${previousTotalHours.toFixed(2)} → ${newTotalHours.toFixed(2)} horas` :
        `Nuevo resumen creado con ${newTotalHours.toFixed(2)} horas totales`;

      // Get user information for audit
      const userInfo = await getUserInfo(internalId);

      await AuditModel.registerAudit(
        internalId,
        "INSERT",
        "Extra_Hours",
        `${userInfo} creó un ajuste de horas extra completo ID ${adjustment.Hours_ID} para el estudiante ${studentName} (Cédula: ${data.Internal_ID}, Área: ${studentArea}) - Fecha: ${hoursDate}, Tipo: ${hoursType}, ${actionType} ${hoursNum} horas, Motivo: ${hoursReason}. ${summaryInfo}`
      );

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
