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
  static async create(data) {
    try {
      return await Attendance_Record.create(data);
    } catch (error) {
      console.error("Create error:", error);
      throw new Error(`Error creating attendance record: ${error.message}`);
    }
  }

  // Soft delete record
  static async delete(id) {
    try {
      const record = await this.getById(id);
      if (!record) return null;

      const [updated] = await Attendance_Record.update(
        { Attendance_IsDeleted: true },
        { where: { Attendance_ID: id, Attendance_IsDeleted: false } }
      );
      return updated > 0;
    } catch (error) {
      throw new Error(`Error deleting attendance record: ${error.message}`);
    }
  }

  // Update basic fields
  static async update(id, data) {
    try {
      const record = await this.getById(id);
      if (!record) return null;

      const [updated] = await Attendance_Record.update(data, {
        where: { Attendance_ID: id, Attendance_IsDeleted: false },
      });
      return updated > 0 ? await this.getById(id) : null;
    } catch (error) {
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

static async updateClosedWithSummary(recordId, newData) {
  const t = await sequelize.transaction();
  try {
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
    const generalSummary = await Student_Hours_SummaryModel.getByCedula(studentId);

    if (!generalSummary) throw new Error("Student summary not found");

    const newTotal = parseFloat(generalSummary.Summary_Total_Hours) - oldDiffHours + newDiffHours;
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

    await t.commit();
    return updatedRecord;
  } catch (error) {
    await t.rollback();
    throw new Error(`Error updating closed attendance record: ${error.message}`);
  }
}

static async getOpenRecordsWithUser() {
  try {
    return await Attendance_Record.findAll({
      where: {
        Attendance_IsDeleted: false,
        Attendance_Exit: null
      },
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
              attributes: [
                "Internal_ID", 
                "Internal_Name", 
                "Internal_LastName", 
                "Internal_Email", 
                "Internal_Area"
              ],
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

static async deleteWithAdjustment(recordId) {
  const t = await sequelize.transaction();
  try {
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

static async createWithSummary(data) {
  const t = await sequelize.transaction();
  try {
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
    const periodId = userXPeriodRecord.period ? userXPeriodRecord.period.Period_ID : null;
    if (!periodId) throw new Error("Unable to determine period ID.");

    let generalSummary = await Student_Hours_SummaryModel.getByUser(studentId);
    if (generalSummary) {
      const newTotal = parseFloat(generalSummary.Summary_Total_Hours) + diffHours;
      const fields = checkCompletionFields(newTotal);
      await Student_Hours_SummaryModel.update(generalSummary.Summary_ID, {
        Summary_Total_Hours: newTotal,
        ...fields
      }, { transaction: t });

      generalSummary.Summary_Total_Hours = newTotal;
    } else {
      const newTotal = diffHours; // <- aquí ahora sí defines correctamente
      const fields = checkCompletionFields(newTotal);
      generalSummary = await Student_Hours_SummaryModel.create({
        Internal_ID: studentId,
        Summary_Start: entry, // ✅ Campo correcto según el schema: entry,
        Summary_Total_Hours: newTotal,
        ...fields
      }, { transaction: t });
    }

    await this.updateWeeklySummary(periodId, entry, diffHours, t, generalSummary.Summary_ID);

    await t.commit();
    return newRecord;
  } catch (error) {
    await t.rollback();
    console.log("Error in createWithSummary:", error);
    throw new Error(`Error creating attendance and summary: ${error.message}`);
  }
}

static async updateExitWithSummary(recordId, data) {
  const t = await sequelize.transaction();
  try {
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
    const periodId = userXPeriodRecord.period ? userXPeriodRecord.period.Period_ID : null;
    if (!periodId) throw new Error("Unable to determine period");

    let generalSummary = await Student_Hours_SummaryModel.getByUser(studentId);
    if (generalSummary) {
      const newTotal = parseFloat(generalSummary.Summary_Total_Hours) + diffHours;
      const fields = checkCompletionFields(newTotal);
      await Student_Hours_SummaryModel.update(generalSummary.Summary_ID, {
        Summary_Total_Hours: newTotal,
        ...fields
      }, { transaction: t });

      generalSummary.Summary_Total_Hours = newTotal;
    } else {
      const newTotal = diffHours;
      const fields = checkCompletionFields(newTotal);
      generalSummary = await Student_Hours_SummaryModel.create({
        Internal_ID: studentId,
        Summary_Start: entry, // ✅ Campo correcto según el schema: entry,
        Summary_Total_Hours: newTotal,
        ...fields
      }, { transaction: t });
    }

    await this.updateWeeklySummary(periodId, entry, diffHours, t, generalSummary.Summary_ID);

    await t.commit();
    return await this.getById(recordId);
  } catch (error) {
    await t.rollback();
    throw new Error(`Error updating attendance with exit: ${error.message}`);
  }
}





}