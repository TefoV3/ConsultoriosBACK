import { Attendance_Record } from "../../schemas/schedules_tables/Attendance_Record.js";
import { Student_Hours_SummaryModel } from "./Student_Hours_SummaryModel.js";
import { UserXPeriodModel } from "./User_PeriodModel.js";
import { UserXPeriod } from "../../schemas/schedules_tables/UserXPeriod.js";
import { InternalUser } from "../../schemas/Internal_User.js";
import { Period } from "../../schemas/schedules_tables/Period.js";
import { Weekly_Tracking } from "../../schemas/schedules_tables/Weekly_Tracking.js";
import { Weekly_Hours_Summary } from "../../schemas/schedules_tables/Weekly_Hours_Summary.js";
import { Op } from "sequelize";
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

// Reusable constant
const MAX_HOURS = 500;

// Helper: check if summary is complete
/*function isSummaryComplete(totalHours) {
  return parseFloat(totalHours) >= MAX_HOURS;
}*/

function checkCompletionFields(newTotal) {
  const isComplete = parseFloat(newTotal) >= 500;
  return {
    Summary_IsComplete: isComplete,
    Summary_End: isComplete ? new Date() : null
  };
}


export class Attendance_RecordModel {
  // Get all active attendance records
  static async getAllRecords() {
    try {
      return await Attendance_Record.findAll({
        where: { Attendance_IsDeleted: false },
      });
    } catch (error) {
      throw new Error(`Error retrieving attendance records: ${error.message}`);
    }
  }

  // Get one attendance record by ID
  static async getById(id) {
    try {
      return await Attendance_Record.findOne({
        where: { Attendance_ID: id, Attendance_IsDeleted: false },
      });
    } catch (error) {
      throw new Error(`Error retrieving attendance record: ${error.message}`);
    }
  }

  // Create attendance record only
  static async create(data, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      
      const newRecord = await Attendance_Record.create(data, { transaction: t });

      // Get detailed user information for audit
      const userXPeriodRecord = await UserXPeriodModel.getByUserXPeriodId(data.UserXPeriod_ID);
      const studentId = userXPeriodRecord?.user?.Internal_ID || 'Desconocido';
      const studentName = userXPeriodRecord?.user ? 
        `${userXPeriodRecord.user.Internal_Name} ${userXPeriodRecord.user.Internal_LastName}` : 
        'Usuario Desconocido';
      const studentArea = userXPeriodRecord?.user?.Internal_Area || 'Área no especificada';
      const periodName = userXPeriodRecord?.period?.Period_Name || 'Período no especificado';

      // Format times for detailed audit message
      const entryTime = data.Attendance_Entry ? new Date(data.Attendance_Entry).toLocaleString('es-ES') : 'Sin registrar';
      const exitTime = data.Attendance_Exit ? new Date(data.Attendance_Exit).toLocaleString('es-ES') : 'Sin registrar';
      const attendanceType = data.Attendance_Type || 'No especificado';

      // Get user information for audit
      const userInfo = await getUserInfo(internalId);

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "INSERT",
        "Attendance_Record",
        `${userInfo} creó un registro de asistencia ID ${newRecord.Attendance_ID} para el estudiante ${studentName} (Cédula: ${studentId}, Área: ${studentArea}) del período ${periodName} - Entrada: ${entryTime}, Salida: ${exitTime}, Tipo: ${attendanceType}`
      );

      await t.commit();
      return newRecord;
    } catch (error) {
      await t.rollback();
      console.error("Error en Attendance_RecordModel.create:", error);
      throw new Error(`Error creating attendance record: ${error.message}`);
    }
  }

  // Soft delete record
  static async delete(id, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      const record = await this.getById(id);
      if (!record) return null;

      const [updated] = await Attendance_Record.update(
        { Attendance_IsDeleted: true },
        { 
          where: { Attendance_ID: id, Attendance_IsDeleted: false },
          transaction: t,
        }
      );

      if (updated > 0) {
        // Get detailed user information for audit
        const userXPeriodRecord = await UserXPeriodModel.getByUserXPeriodId(record.UserXPeriod_ID);
        const studentId = userXPeriodRecord?.user?.Internal_ID || 'Desconocido';
        const studentName = userXPeriodRecord?.user ? 
          `${userXPeriodRecord.user.Internal_Name} ${userXPeriodRecord.user.Internal_LastName}` : 
          'Usuario Desconocido';
        const studentArea = userXPeriodRecord?.user?.Internal_Area || 'Área no especificada';
        const periodName = userXPeriodRecord?.period?.Period_Name || 'Período no especificado';

        // Format times for detailed audit
        const entryTime = record.Attendance_Entry ? new Date(record.Attendance_Entry).toLocaleString('es-ES') : 'Sin entrada';
        const exitTime = record.Attendance_Exit ? new Date(record.Attendance_Exit).toLocaleString('es-ES') : 'Sin salida';

        // Get user information for audit
        const userInfo = await getUserInfo(internalId);

        // Register detailed audit
        await AuditModel.registerAudit(
          internalId,
          "DELETE",
          "Attendance_Record",
          `${userInfo} eliminó el registro de asistencia ID ${id} del estudiante ${studentName} (Cédula: ${studentId}, Área: ${studentArea}) del período ${periodName} - Registro eliminado: Entrada ${entryTime}, Salida ${exitTime}`
        );

        await t.commit();
        return true;
      } else {
        await t.rollback();
        return false;
      }
    } catch (error) {
      await t.rollback();
      console.error("Error en Attendance_RecordModel.delete:", error);
      throw new Error(`Error deleting attendance record: ${error.message}`);
    }
  }

  // Update basic fields
  static async update(id, data, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      const record = await this.getById(id);
      if (!record) return null;

      const [updated] = await Attendance_Record.update(data, {
        where: { Attendance_ID: id, Attendance_IsDeleted: false },
        transaction: t,
      });

      if (updated > 0) {
        // Get detailed user information for audit
        const userXPeriodRecord = await UserXPeriodModel.getByUserXPeriodId(record.UserXPeriod_ID);
        const studentId = userXPeriodRecord?.user?.Internal_ID || 'Desconocido';
        const studentName = userXPeriodRecord?.user ? 
          `${userXPeriodRecord.user.Internal_Name} ${userXPeriodRecord.user.Internal_LastName}` : 
          'Usuario Desconocido';
        const studentArea = userXPeriodRecord?.user?.Internal_Area || 'Área no especificada';
        const periodName = userXPeriodRecord?.period?.Period_Name || 'Período no especificado';

        // Get user information for audit
        const userInfo = await getUserInfo(internalId);

        // Track field changes for detailed audit
        const updatedRecord = await this.getById(id);
        const changes = [];
        
        if (data.Attendance_Entry && new Date(data.Attendance_Entry).getTime() !== new Date(record.Attendance_Entry).getTime()) {
          const oldEntry = record.Attendance_Entry ? new Date(record.Attendance_Entry).toLocaleString('es-ES') : 'Sin entrada';
          const newEntry = new Date(data.Attendance_Entry).toLocaleString('es-ES');
          changes.push(`Entrada: ${oldEntry} → ${newEntry}`);
        }
        
        if (data.Attendance_Exit && new Date(data.Attendance_Exit).getTime() !== new Date(record.Attendance_Exit).getTime()) {
          const oldExit = record.Attendance_Exit ? new Date(record.Attendance_Exit).toLocaleString('es-ES') : 'Sin salida';
          const newExit = new Date(data.Attendance_Exit).toLocaleString('es-ES');
          changes.push(`Salida: ${oldExit} → ${newExit}`);
        }
        
        if (data.Attendance_Type && data.Attendance_Type !== record.Attendance_Type) {
          changes.push(`Tipo: ${record.Attendance_Type || 'No especificado'} → ${data.Attendance_Type}`);
        }

        const changeDetails = changes.length > 0 ? ` - Cambios: ${changes.join(', ')}` : '';

        // Register detailed audit
        await AuditModel.registerAudit(
          internalId,
          "UPDATE",
          "Attendance_Record",
          `${userInfo} actualizó el registro de asistencia ID ${id} del estudiante ${studentName} (Cédula: ${studentId}, Área: ${studentArea}) del período ${periodName}${changeDetails}`
        );

        await t.commit();
        return await this.getById(id);
      } else {
        await t.rollback();
        return null;
      }
    } catch (error) {
      await t.rollback();
      console.error("Error en Attendance_RecordModel.update:", error);
      throw new Error(`Error updating attendance record: ${error.message}`);
    }
  }

  // Get open record (no exit)
  static async getOpenRecord(userXPeriodId, date, mode) {
    try {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);

      const whereClause = {
        UserXPeriod_ID: userXPeriodId,
        Attendance_IsDeleted: false,
        Attendance_Exit: null,
        Attendance_Entry: { [Op.between]: [start, end] },
      };

      if (mode && mode.trim() !== "") {
        whereClause.Attendance_Type = mode;
      }

      return await Attendance_Record.findOne({ where: whereClause });
    } catch (error) {
      throw new Error(`Error retrieving open record: ${error.message}`);
    }
  }

  // Get completed virtual attendance for date
  static async getCompletedVirtualRecord(userXPeriodId, date) {
    try {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);

      return await Attendance_Record.findOne({
        where: {
          UserXPeriod_ID: userXPeriodId,
          Attendance_IsDeleted: false,
          Attendance_Type: "Virtual",
          Attendance_Entry: { [Op.between]: [start, end] },
          Attendance_Exit: { [Op.ne]: null },
        },
      });
    } catch (error) {
      throw new Error(`Error retrieving completed virtual record: ${error.message}`);
    }
  }

  static async getClosedRecords() {
  try {
    return await Attendance_Record.findAll({
      where: {
        Attendance_IsDeleted: false,
        Attendance_Entry: { [Op.ne]: null },
        Attendance_Exit: { [Op.ne]: null }
      },
      include: [
        {
          model: UserXPeriod,
          as: 'userXPeriod',
          attributes: ['UserXPeriod_ID', 'Period_ID'],
          where: { UserXPeriod_IsDeleted: false },
          include: [
            {
              model: InternalUser,
              as: 'user',
              attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"],
              where: { Internal_Status: 'Activo' }
            },
            {
              model: Period,
              as: 'period',
              attributes: ["Period_ID", "Period_Name"],
              where: { Period_IsDeleted: false }
            }
          ]
        }
      ]
    });
  } catch (error) {
    throw new Error(`Error getting closed attendance records: ${error.message}`);
  }
}

static async updateClosedWithSummary(recordId, newData, internalUser) {
  const t = await sequelize.transaction();
  try {
    const internalId = internalUser || getUserId();
    
    const record = await Attendance_Record.findOne({
      where: { Attendance_ID: recordId, Attendance_IsDeleted: false },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!record) throw new Error("Attendance record not found");
    if (!record.Attendance_Entry || !record.Attendance_Exit)
      throw new Error("The record is not closed and cannot be updated with this method");

    const oldEntry = new Date(record.Attendance_Entry);
    const oldExit = new Date(record.Attendance_Exit);
    const oldDiffHours = (oldExit - oldEntry) / (1000 * 60 * 60);

    await Attendance_Record.update(newData, {
      where: { Attendance_ID: recordId, Attendance_IsDeleted: false },
      transaction: t
    });

    const updatedRecord = await Attendance_Record.findOne({
      where: { Attendance_ID: recordId, Attendance_IsDeleted: false },
      transaction: t
    });

    if (!updatedRecord.Attendance_Entry || !updatedRecord.Attendance_Exit)
      throw new Error("Updated record is not complete");

    const newEntry = new Date(updatedRecord.Attendance_Entry);
    const newExit = new Date(updatedRecord.Attendance_Exit);
    const newDiffHours = (newExit - newEntry) / (1000 * 60 * 60);

    const userXPeriodId = updatedRecord.UserXPeriod_ID;
    if (!userXPeriodId) throw new Error("UserXPeriod_ID not found");

    const userXPeriodRecord = await UserXPeriodModel.getByUserXPeriodId(userXPeriodId);
    if (!userXPeriodRecord || !userXPeriodRecord.user || !userXPeriodRecord.user.Internal_ID)
      throw new Error("User Internal_ID not found");

    const studentId = userXPeriodRecord.user.Internal_ID;
    const studentName = `${userXPeriodRecord.user.Internal_Name} ${userXPeriodRecord.user.Internal_LastName}`;
    const studentArea = userXPeriodRecord.user.Internal_Area || 'Área no especificada';
    const periodName = userXPeriodRecord.period?.Period_Name || 'Período no especificado';
    const generalSummary = await Student_Hours_SummaryModel.getByCedula(studentId);

    if (!generalSummary) throw new Error("Student summary not found");

    const previousTotalHours = parseFloat(generalSummary.Summary_Total_Hours);
    const newTotal = previousTotalHours - oldDiffHours + newDiffHours;
    if (newTotal < 0) throw new Error("Update would result in negative total hours");

    const fields = checkCompletionFields(newTotal);
    await Student_Hours_SummaryModel.update(generalSummary.Summary_ID, {
      Summary_Total_Hours: newTotal,
      ...fields
    }, { transaction: t });

    const periodId = userXPeriodRecord.period ? userXPeriodRecord.period.Period_ID : null;
    if (!periodId) throw new Error("Period ID could not be determined");

    const diffForWeekly = newDiffHours - oldDiffHours;
    await this.updateWeeklySummary(periodId, newEntry, diffForWeekly, t, generalSummary.Summary_ID);

    // Get user information for audit
    const userInfo = await getUserInfo(internalId);

    // Register detailed audit with before/after comparison
    const oldEntryTime = oldEntry.toLocaleString('es-ES');
    const oldExitTime = oldExit.toLocaleString('es-ES');
    const newEntryTime = newEntry.toLocaleString('es-ES');
    const newExitTime = newExit.toLocaleString('es-ES');
    const attendanceType = updatedRecord.Attendance_Type || 'No especificado';
    await AuditModel.registerAudit(
      internalId,
      "UPDATE",
      "Attendance_Record",
      `${userInfo} modificó el registro cerrado de asistencia ID ${recordId} del estudiante ${studentName} (Cédula: ${studentId}, Área: ${studentArea}) del período ${periodName} - ANTERIOR: Entrada ${oldEntryTime}, Salida ${oldExitTime} (${oldDiffHours.toFixed(2)}h) → NUEVO: Entrada ${newEntryTime}, Salida ${newExitTime} (${newDiffHours.toFixed(2)}h), Tipo: ${attendanceType}. Total de horas actualizado: ${previousTotalHours.toFixed(2)} → ${newTotal.toFixed(2)} horas`
    );

    await t.commit();
    return updatedRecord;
  } catch (error) {
    await t.rollback();
    console.error("Error en updateClosedWithSummary:", error);
    throw new Error(`Error updating closed attendance record: ${error.message}`);
  }
}

static async getOpenRecordsWithUser({ entryRange = null } = {}) {
  try {
    const where = {
      Attendance_IsDeleted: false,
      Attendance_Exit: null
    };

    if (entryRange) {
      where.Attendance_Entry = { [Op.between]: entryRange };
    }

    return await Attendance_Record.findAll({
      where,
      include: [
        {
          model: UserXPeriod,
          as: 'userXPeriod',
          attributes: ['UserXPeriod_ID'],
          where: { UserXPeriod_IsDeleted: false },
          include: [
            {
              model: InternalUser,
              as: 'user',
              attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"],
              where: { Internal_Status: 'Activo' }
            }
          ]
        }
      ]
    });
  } catch (error) {
    throw new Error(`Error retrieving open records with user info: ${error.message}`);
  }
}


static async deleteWithAdjustment(recordId, internalUser) {
  const t = await sequelize.transaction();
  try {
    const internalId = internalUser || getUserId();
    
    const record = await Attendance_Record.findOne({
      where: { Attendance_ID: recordId, Attendance_IsDeleted: false },
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    if (!record) throw new Error("Attendance record not found");
    if (!record.Attendance_Entry || !record.Attendance_Exit) {
      throw new Error("The record is not closed; it cannot be deleted with adjustment");
    }

    const entry = new Date(record.Attendance_Entry);
    const exit = new Date(record.Attendance_Exit);
    const diffHours = (exit - entry) / (1000 * 60 * 60);

    const [rowsUpdated] = await Attendance_Record.update(
      { Attendance_IsDeleted: true },
      { where: { Attendance_ID: recordId }, transaction: t }
    );
    if (rowsUpdated === 0) throw new Error("Failed to mark record as deleted");

    const userXPeriodId = record.UserXPeriod_ID;
    const userXPeriod = await UserXPeriodModel.getByUserXPeriodId(userXPeriodId);
    if (!userXPeriod || !userXPeriod.user || !userXPeriod.user.Internal_ID) {
      throw new Error("Could not determine student ID");
    }

    const studentId = userXPeriod.user.Internal_ID;
    const generalSummary = await Student_Hours_SummaryModel.getByCedula(studentId);
    if (!generalSummary) throw new Error("Summary not found for student");

    const newTotal = parseFloat(generalSummary.Summary_Total_Hours) - diffHours;
    const finalTotal = Math.max(newTotal, 0);

    const fields = checkCompletionFields(newTotal);
    await Student_Hours_SummaryModel.update(
      generalSummary.Summary_ID,
      {
        Summary_Total_Hours: newTotal,
        ...fields
      },
      { transaction: t }
    );

    const periodId = userXPeriod.period ? userXPeriod.period.Period_ID : null;
    if (!periodId) throw new Error("Could not determine period");

    await this.updateWeeklySummary(periodId, entry, -diffHours, t, generalSummary.Summary_ID);

    // Get detailed user information for audit
    const studentName = userXPeriod.user ? 
      `${userXPeriod.user.Internal_Name} ${userXPeriod.user.Internal_LastName}` : 
      'Usuario Desconocido';
    const studentArea = userXPeriod.user.Internal_Area || 'Área no especificada';
    const periodName = userXPeriod.period?.Period_Name || 'Período no especificado';
    const entryTime = entry.toLocaleString('es-ES');
    const exitTime = exit.toLocaleString('es-ES');
    const previousHours = parseFloat(generalSummary.Summary_Total_Hours).toFixed(2);
    const newHours = finalTotal.toFixed(2);

    // Get user information for audit
    const userInfo = await getUserInfo(internalId);

    // Register detailed audit
    await AuditModel.registerAudit(
      internalId,
      "DELETE",
      "Attendance_Record",
      `${userInfo} eliminó con ajuste el registro de asistencia ID ${recordId} del estudiante ${studentName} (Cédula: ${studentId}, Área: ${studentArea}) del período ${periodName} - Entrada: ${entryTime}, Salida: ${exitTime}, Duración: ${diffHours.toFixed(2)} horas. Horas totales actualizadas de ${previousHours} a ${newHours}`
    );

    await t.commit();
    return true;
  } catch (error) {
    await t.rollback();
    console.error("Error in deleteWithAdjustment:", error);
    throw new Error(`Error deleting record with adjustment: ${error.message}`);
  }
}

static async updateWeeklySummary(periodId, attendanceDate, diffHours, transaction, summaryId) {
  const startOfDay = new Date(attendanceDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(attendanceDate);
  endOfDay.setHours(23, 59, 59, 999);

  const tracking = await Weekly_Tracking.findOne({
    where: {
      Period_ID: periodId,
      Week_IsDeleted: false,
      Week_Start: { [Op.lte]: endOfDay },
      Week_End: { [Op.gte]: startOfDay }
    },
    transaction
  });

  if (!tracking) {
    throw new Error("Attendance record is outside of any defined weekly tracking range.");
  }

  const existingSummary = await Weekly_Hours_Summary.findOne({
    where: {
      Summary_ID: summaryId,
      Week_Number: tracking.Week_Number,
      Hours_IsDeleted: false
    },
    transaction
  });

  if (existingSummary) {
    const newTotal = parseFloat(existingSummary.Attendance_Hours) + diffHours;
    if (newTotal < 0) {
      throw new Error("Weekly adjustment would result in negative total hours.");
    }
    await Weekly_Hours_Summary.update(
      { Attendance_Hours: newTotal },
      {
        where: { WeeklySummary_ID: existingSummary.WeeklySummary_ID },
        transaction
      }
    );
  } else {
    await Weekly_Hours_Summary.create(
      {
        Summary_ID: summaryId,
        Week_Number: tracking.Week_Number,
        Week_Start: tracking.Week_Start,
        Week_End: tracking.Week_End,
        Attendance_Hours: diffHours,
        Hours_IsDeleted: false
      },
      { transaction }
    );
  }
}

static async createWithSummary(data, internalUser) {
  const t = await sequelize.transaction();
  try {
    const internalId = internalUser || getUserId();
    
    const newRecord = await Attendance_Record.create(data, { transaction: t });

    if (!newRecord.Attendance_Entry || !newRecord.Attendance_Exit) {
      throw new Error("Both entry and exit times must be provided.");
    }

    const entry = new Date(newRecord.Attendance_Entry);
    const exit = new Date(newRecord.Attendance_Exit);
    const diffHours = (exit - entry) / (1000 * 60 * 60);

    const userXPeriodId = newRecord.UserXPeriod_ID;
    if (!userXPeriodId) throw new Error("Missing UserXPeriod_ID in the record.");

    const userXPeriodRecord = await UserXPeriodModel.getByUserXPeriodId(userXPeriodId);
    if (!userXPeriodRecord || !userXPeriodRecord.user || !userXPeriodRecord.user.Internal_ID) {
      throw new Error("Unable to determine student ID.");
    }

    const studentId = userXPeriodRecord.user.Internal_ID;
    const studentName = `${userXPeriodRecord.user.Internal_Name} ${userXPeriodRecord.user.Internal_LastName}`;
    const studentArea = userXPeriodRecord.user.Internal_Area || 'Área no especificada';
    const periodId = userXPeriodRecord.period ? userXPeriodRecord.period.Period_ID : null;
    const periodName = userXPeriodRecord.period?.Period_Name || 'Período no especificado';
    if (!periodId) throw new Error("Unable to determine period ID.");

    let generalSummary = await Student_Hours_SummaryModel.getByUser(studentId);
    let previousTotalHours = 0;
    let newTotalHours = diffHours;

    if (generalSummary) {
      previousTotalHours = parseFloat(generalSummary.Summary_Total_Hours);
      newTotalHours = previousTotalHours + diffHours;
      const fields = checkCompletionFields(newTotalHours);
      await Student_Hours_SummaryModel.update(generalSummary.Summary_ID, {
        Summary_Total_Hours: newTotalHours,
        ...fields
      }, { transaction: t });

      generalSummary.Summary_Total_Hours = newTotalHours;
    } else {
      const fields = checkCompletionFields(newTotalHours);
      generalSummary = await Student_Hours_SummaryModel.create({
        Internal_ID: studentId,
        Summary_Start: entry,
        Summary_Total_Hours: newTotalHours,
        ...fields
      }, { transaction: t });
    }

    await this.updateWeeklySummary(periodId, entry, diffHours, t, generalSummary.Summary_ID);

    // Get user information for audit
    const userInfo = await getUserInfo(internalId);

    // Register detailed audit with summary information
    const entryTime = entry.toLocaleString('es-ES');
    const exitTime = exit.toLocaleString('es-ES');
    const attendanceType = data.Attendance_Type || 'No especificado';
    await AuditModel.registerAudit(
      internalId,
      "INSERT",
      "Attendance_Record",
      `${userInfo} creó un registro de asistencia completo ID ${newRecord.Attendance_ID} para el estudiante ${studentName} (Cédula: ${studentId}, Área: ${studentArea}) del período ${periodName} - Entrada: ${entryTime}, Salida: ${exitTime}, Horas registradas: ${diffHours.toFixed(2)}, Tipo: ${attendanceType}. Total de horas actualizado: ${previousTotalHours.toFixed(2)} → ${newTotalHours.toFixed(2)} horas`
    );

    await t.commit();
    return newRecord;
  } catch (error) {
    await t.rollback();
    console.log("Error in createWithSummary:", error);
    throw new Error(`Error creating attendance and summary: ${error.message}`);
  }
}

static async updateExitWithSummary(recordId, data, internalUser) {
  const t = await sequelize.transaction();
  try {
    const internalId = internalUser || getUserId();
    
    const record = await Attendance_Record.findOne({
      where: { Attendance_ID: recordId, Attendance_IsDeleted: false },
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    if (!record) throw new Error("Attendance record not found");
    if (!record.Attendance_Entry) throw new Error("Entry time is missing");

    await Attendance_Record.update(data, {
      where: { Attendance_ID: recordId, Attendance_IsDeleted: false },
      transaction: t
    });

    const entry = new Date(record.Attendance_Entry);
    const exit = new Date(data.Attendance_Exit);
    const diffHours = (exit - entry) / (1000 * 60 * 60);

    const userXPeriodId = record.UserXPeriod_ID;
    if (!userXPeriodId) throw new Error("Missing UserXPeriod_ID");

    const userXPeriodRecord = await UserXPeriodModel.getByUserXPeriodId(userXPeriodId);
    if (!userXPeriodRecord || !userXPeriodRecord.user || !userXPeriodRecord.user.Internal_ID) {
      throw new Error("Unable to determine student ID");
    }

    const studentId = userXPeriodRecord.user.Internal_ID;
    const studentName = `${userXPeriodRecord.user.Internal_Name} ${userXPeriodRecord.user.Internal_LastName}`;
    const studentArea = userXPeriodRecord.user.Internal_Area || 'Área no especificada';
    const periodId = userXPeriodRecord.period ? userXPeriodRecord.period.Period_ID : null;
    const periodName = userXPeriodRecord.period?.Period_Name || 'Período no especificado';
    if (!periodId) throw new Error("Unable to determine period");

    let generalSummary = await Student_Hours_SummaryModel.getByUser(studentId);
    let previousTotalHours = 0;
    let newTotalHours = diffHours;

    if (generalSummary) {
      previousTotalHours = parseFloat(generalSummary.Summary_Total_Hours);
      newTotalHours = previousTotalHours + diffHours;
      const fields = checkCompletionFields(newTotalHours);
      await Student_Hours_SummaryModel.update(generalSummary.Summary_ID, {
        Summary_Total_Hours: newTotalHours,
        ...fields
      }, { transaction: t });

      generalSummary.Summary_Total_Hours = newTotalHours;
    } else {
      const fields = checkCompletionFields(newTotalHours);
      generalSummary = await Student_Hours_SummaryModel.create({
        Internal_ID: studentId,
        Summary_Start: entry,
        Summary_Total_Hours: newTotalHours,
        ...fields
      }, { transaction: t });
    }

    await this.updateWeeklySummary(periodId, entry, diffHours, t, generalSummary.Summary_ID);

    // Get user information for audit
    const userInfo = await getUserInfo(internalId);

    // Register detailed audit with exit information
    const entryTime = entry.toLocaleString('es-ES');
    const exitTime = exit.toLocaleString('es-ES');
    const attendanceType = record.Attendance_Type || 'No especificado';
    await AuditModel.registerAudit(
      internalId,
      "UPDATE",
      "Attendance_Record",
      `${userInfo} registró la salida del estudiante ${studentName} (Cédula: ${studentId}, Área: ${studentArea}) del período ${periodName} en el registro ID ${recordId} - Entrada: ${entryTime}, Salida: ${exitTime}, Horas trabajadas: ${diffHours.toFixed(2)}, Tipo: ${attendanceType}. Total de horas actualizado: ${previousTotalHours.toFixed(2)} → ${newTotalHours.toFixed(2)} horas`
    );

    await t.commit();
    return await this.getById(recordId);
  } catch (error) {
    await t.rollback();
    console.error("Error en updateExitWithSummary:", error);
    throw new Error(`Error updating attendance with exit: ${error.message}`);
  }
}





}
