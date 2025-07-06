import { Weekly_Tracking } from "../../schemas/schedules_tables/Weekly_Tracking.js";
import { Period } from "../../schemas/schedules_tables/Period.js";
import { Op } from "sequelize";
import { AuditModel } from "../AuditModel.js";
import { getUserId } from "../../sessionData.js";
import { sequelize } from "../../database/database.js";

// Helper to calculate week blocks between two dates
function calculateWeeks(periodId, start, end) {
  const weeks = [];
  let startDate = new Date(start);
  const endDate = new Date(end);
  let weekNumber = 1;

  function getFriday(fromDate) {
    const day = fromDate.getDay();
    const diff = 5 - day;
    const friday = new Date(fromDate);
    friday.setDate(fromDate.getDate() + diff);
    return friday;
  }

  function getNextMonday(date) {
    const monday = new Date(date);
    const day = monday.getDay();
    const diff = (8 - day) % 7;
    monday.setDate(monday.getDate() + diff);
    return monday;
  }

  if (startDate.getDay() !== 1) {
    let weekEnd = getFriday(startDate);
    if (weekEnd > endDate) weekEnd = new Date(endDate);

    weeks.push({
      Period_ID: periodId,
      Week_Number: weekNumber++,
      Week_Start: startDate.toISOString(),
      Week_End: weekEnd.toISOString(),
      Week_Hours: 0,
      Week_Holiday: 0,
      Week_Comment: null,
      Week_IsDeleted: false,
    });

    startDate = getNextMonday(startDate);
  }

  while (startDate <= endDate) {
    const weekStart = new Date(startDate);
    let weekEnd = getFriday(weekStart);
    if (weekEnd > endDate) weekEnd = new Date(endDate);

    weeks.push({
      Period_ID: periodId,
      Week_Number: weekNumber++,
      Week_Start: weekStart.toISOString(),
      Week_End: weekEnd.toISOString(),
      Week_Hours: 0,
      Week_Holiday: 0,
      Week_Comment: null,
      Week_IsDeleted: false,
    });

    startDate.setDate(startDate.getDate() + 7);
  }

  return weeks;
}

export class Weekly_TrackingModel {
  static async getAll() {
    return await Weekly_Tracking.findAll({ where: { Week_IsDeleted: false } });
  }

  static async getById(id) {
    return await Weekly_Tracking.findOne({ where: { Week_ID: id, Week_IsDeleted: false } });
  }

  static async getLastByPeriod(periodId) {
    return await Weekly_Tracking.findOne({
      where: { Period_ID: periodId, Week_IsDeleted: false },
      order: [["Week_Number", "DESC"]],
    });
  }

  static async create(data, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      
      const newRecord = await Weekly_Tracking.create(data, { transaction: t });

      // Get period information for audit
      const period = await Period.findOne({
        where: { Period_ID: data.Period_ID },
        attributes: ["Period_ID", "Period_Name"]
      });

      const periodName = period?.Period_Name || 'Período no especificado';
      const weekStart = data.Week_Start ? new Date(data.Week_Start).toLocaleDateString('es-ES') : 'Sin fecha';
      const weekEnd = data.Week_End ? new Date(data.Week_End).toLocaleDateString('es-ES') : 'Sin fecha';
      const weekHours = data.Week_Hours || 0;
      const weekHoliday = data.Week_Holiday || 0;
      const weekNumber = data.Week_Number || 'No especificado';

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "INSERT",
        "Weekly_Tracking",
        `El usuario interno ${internalId} creó un seguimiento semanal ID ${newRecord.Week_ID} para el período ${periodName} (ID: ${data.Period_ID}) - Semana ${weekNumber}: ${weekStart} - ${weekEnd}, Horas programadas: ${weekHours}, Horas feriado: ${weekHoliday}`
      );

      await t.commit();
      return newRecord;
    } catch (error) {
      await t.rollback();
      console.error("Error en Weekly_TrackingModel.create:", error);
      throw new Error(`Error creating weekly tracking: ${error.message}`);
    }
  }

  static async createBulk(data, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      
      const newRecords = await Weekly_Tracking.bulkCreate(data, { transaction: t });

      // Get period information for audit
      const periodId = data.length > 0 ? data[0].Period_ID : null;
      const period = periodId ? await Period.findOne({
        where: { Period_ID: periodId },
        attributes: ["Period_ID", "Period_Name"]
      }) : null;

      const periodName = period?.Period_Name || 'Período no especificado';
      const weekCount = data.length;
      const totalHours = data.reduce((sum, week) => sum + (parseFloat(week.Week_Hours) || 0), 0);

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "INSERT",
        "Weekly_Tracking",
        `El usuario interno ${internalId} creó ${weekCount} seguimientos semanales en lote para el período ${periodName} (ID: ${periodId}) - Total de horas programadas: ${totalHours}`
      );

      await t.commit();
      return newRecords;
    } catch (error) {
      await t.rollback();
      console.error("Error en Weekly_TrackingModel.createBulk:", error);
      throw new Error(`Error creating bulk weekly tracking: ${error.message}`);
    }
  }

  static async update(id, data, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      const old = await this.getById(id);
      if (!old) return null;

      const oldHours = parseFloat(old.Week_Hours) || 0;
      const oldHoliday = parseFloat(old.Week_Holiday) || 0;

      const newHours = "Week_Hours" in data ? parseFloat(data.Week_Hours) || 0 : oldHours;
      const newHoliday = "Week_Holiday" in data ? parseFloat(data.Week_Holiday) || 0 : oldHoliday;

      if (newHoliday > newHours) {
        throw new Error("Holiday hours cannot exceed total week hours.");
      }

      const oldNet = oldHours - oldHoliday;
      const newNet = newHours - newHoliday;
      const diff = newNet - oldNet;

      await Weekly_Tracking.update(data, {
        where: { Week_ID: id, Week_IsDeleted: false },
        transaction: t
      });

      if (diff !== 0) {
        const updateOp = diff > 0 ? "increment" : "decrement";
        await Period[updateOp](
          { Period_Total_Hours: Math.abs(diff) },
          { where: { Period_ID: old.Period_ID }, transaction: t }
        );
      }

      // Get period information for audit
      const period = await Period.findOne({
        where: { Period_ID: old.Period_ID },
        attributes: ["Period_ID", "Period_Name"]
      });

      const periodName = period?.Period_Name || 'Período no especificado';
      const weekStart = old.Week_Start ? new Date(old.Week_Start).toLocaleDateString('es-ES') : 'Sin fecha';
      const weekEnd = old.Week_End ? new Date(old.Week_End).toLocaleDateString('es-ES') : 'Sin fecha';
      const weekNumber = old.Week_Number || 'No especificado';

      // Build detailed change description
      let changeDetails = [];
      if (oldHours !== newHours) {
        changeDetails.push(`Horas: ${oldHours} → ${newHours}`);
      }
      if (oldHoliday !== newHoliday) {
        changeDetails.push(`Horas feriado: ${oldHoliday} → ${newHoliday}`);
      }
      if (diff !== 0) {
        changeDetails.push(`Horas netas del período: ${diff > 0 ? '+' : ''}${diff.toFixed(2)}`);
      }

      const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : '';

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "UPDATE",
        "Weekly_Tracking",
        `El usuario interno ${internalId} actualizó el seguimiento semanal ID ${id} del período ${periodName} (ID: ${old.Period_ID}) - Semana ${weekNumber}: ${weekStart} - ${weekEnd}${changeDescription}`
      );

      await t.commit();
      return await this.getById(id);
    } catch (error) {
      await t.rollback();
      console.error("Error en Weekly_TrackingModel.update:", error);
      throw new Error(`Error updating weekly tracking: ${error.message}`);
    }
  }

  static async recalculateTotalHours(periodId) {
    const weeks = await Weekly_Tracking.findAll({
      where: { Period_ID: periodId, Week_IsDeleted: false },
    });

    const total = weeks.reduce((acc, w) => {
      const h = parseFloat(w.Week_Hours) || 0;
      const f = parseFloat(w.Week_Holiday) || 0;
      return acc + Math.max(0, h - f);
    }, 0);

    await Period.update({ Period_Total_Hours: total }, { where: { Period_ID: periodId } });
    return total;
  }

  static async recalculateWeeks(periodId, newStartDate, endDate, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      
      const currentWeeks = await Weekly_Tracking.findAll({
        where: { Period_ID: periodId, Week_IsDeleted: false },
        order: [["Week_Start", "ASC"]],
        transaction: t
      });

      const newWeeks = calculateWeeks(periodId, newStartDate, endDate);
      const oldWeekCount = currentWeeks.length;

      for (let i = 0; i < newWeeks.length; i++) {
        const current = newWeeks[i];
        if (i < currentWeeks.length) {
          await Weekly_Tracking.update(
            {
              Week_Number: i + 1,
              Week_Start: current.Week_Start,
              Week_End: current.Week_End,
            },
            { where: { Week_ID: currentWeeks[i].Week_ID }, transaction: t }
          );
        } else {
          current.Week_Number = i + 1;
          await Weekly_Tracking.create(current, { transaction: t });
        }
      }

      if (currentWeeks.length > newWeeks.length) {
        const toDelete = currentWeeks.slice(newWeeks.length);
        const ids = toDelete.map((w) => w.Week_ID);
        await Weekly_Tracking.update(
          { Week_IsDeleted: true },
          { where: { Week_ID: { [Op.in]: ids } }, transaction: t }
        );
      }

      const finalWeeks = await Weekly_Tracking.findAll({
        where: { Period_ID: periodId, Week_IsDeleted: false },
        order: [["Week_Start", "ASC"]],
        transaction: t
      });

      let num = 1;
      for (const week of finalWeeks) {
        week.Week_Number = num++;
        await week.save({ transaction: t });
      }

      const total = finalWeeks.reduce((acc, w) => {
        const h = parseFloat(w.Week_Hours) || 0;
        const f = parseFloat(w.Week_Holiday) || 0;
        return acc + Math.max(0, h - f);
      }, 0);

      await Period.update(
        { Period_Total_Hours: total }, 
        { where: { Period_ID: periodId }, transaction: t }
      );

      // Get period information for audit
      const period = await Period.findOne({
        where: { Period_ID: periodId },
        attributes: ["Period_ID", "Period_Name"]
      });

      const periodName = period?.Period_Name || 'Período no especificado';
      const newStartStr = newStartDate.toLocaleDateString('es-ES');
      const newEndStr = endDate.toLocaleDateString('es-ES');
      const newWeekCount = finalWeeks.length;

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "UPDATE",
        "Weekly_Tracking",
        `El usuario interno ${internalId} recalculó los seguimientos semanales del período ${periodName} (ID: ${periodId}) - Nuevas fechas: ${newStartStr} - ${newEndStr}, Semanas: ${oldWeekCount} → ${newWeekCount}, Total horas: ${total}`
      );

      await t.commit();
      return { weeks: finalWeeks, totalHours: total };
    } catch (error) {
      await t.rollback();
      console.error("Error en Weekly_TrackingModel.recalculateWeeks:", error);
      throw new Error(`Error recalculating weeks: ${error.message}`);
    }
  }

  static async delete(id, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      const week = await this.getById(id);
      if (!week) return null;

      await Weekly_Tracking.update(
        { Week_IsDeleted: true },
        { 
          where: { Week_ID: id, Week_IsDeleted: false },
          transaction: t
        }
      );

      // Get period information for audit
      const period = await Period.findOne({
        where: { Period_ID: week.Period_ID },
        attributes: ["Period_ID", "Period_Name"]
      });

      const periodName = period?.Period_Name || 'Período no especificado';
      const weekStart = week.Week_Start ? new Date(week.Week_Start).toLocaleDateString('es-ES') : 'Sin fecha';
      const weekEnd = week.Week_End ? new Date(week.Week_End).toLocaleDateString('es-ES') : 'Sin fecha';
      const weekNumber = week.Week_Number || 'No especificado';
      const weekHours = week.Week_Hours || 0;
      const weekHoliday = week.Week_Holiday || 0;

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "DELETE",
        "Weekly_Tracking",
        `El usuario interno ${internalId} eliminó el seguimiento semanal ID ${id} del período ${periodName} (ID: ${week.Period_ID}) - Semana ${weekNumber}: ${weekStart} - ${weekEnd}, Horas programadas: ${weekHours}, Horas feriado: ${weekHoliday}`
      );

      await t.commit();
      return week;
    } catch (error) {
      await t.rollback();
      console.error("Error en Weekly_TrackingModel.delete:", error);
      throw new Error(`Error deleting weekly tracking: ${error.message}`);
    }
  }
}
