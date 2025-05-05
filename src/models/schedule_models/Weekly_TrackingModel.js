import { Weekly_Tracking } from "../../schemas/schedules_tables/Weekly_Tracking.js";
import { Period } from "../../schemas/schedules_tables/Period.js";
import { Op } from "sequelize";

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

  static async create(data) {
    return await Weekly_Tracking.create(data);
  }

  static async createBulk(data) {
    return await Weekly_Tracking.bulkCreate(data);
  }

  static async update(id, data) {
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
    });

    if (diff !== 0) {
      const updateOp = diff > 0 ? "increment" : "decrement";
      await Period[updateOp](
        { Period_Total_Hours: Math.abs(diff) },
        { where: { Period_ID: old.Period_ID } }
      );
    }

    return await this.getById(id);
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

  static async recalculateWeeks(periodId, newStartDate, endDate) {
    const currentWeeks = await Weekly_Tracking.findAll({
      where: { Period_ID: periodId, Week_IsDeleted: false },
      order: [["Week_Start", "ASC"]],
    });

    const newWeeks = calculateWeeks(periodId, newStartDate, endDate);

    for (let i = 0; i < newWeeks.length; i++) {
      const current = newWeeks[i];
      if (i < currentWeeks.length) {
        await Weekly_Tracking.update(
          {
            Week_Number: i + 1,
            Week_Start: current.Week_Start,
            Week_End: current.Week_End,
          },
          { where: { Week_ID: currentWeeks[i].Week_ID } }
        );
      } else {
        current.Week_Number = i + 1;
        await Weekly_Tracking.create(current);
      }
    }

    if (currentWeeks.length > newWeeks.length) {
      const toDelete = currentWeeks.slice(newWeeks.length);
      const ids = toDelete.map((w) => w.Week_ID);
      await Weekly_Tracking.update(
        { Week_IsDeleted: true },
        { where: { Week_ID: { [Op.in]: ids } } }
      );
    }

    const finalWeeks = await Weekly_Tracking.findAll({
      where: { Period_ID: periodId, Week_IsDeleted: false },
      order: [["Week_Start", "ASC"]],
    });

    let num = 1;
    for (const week of finalWeeks) {
      week.Week_Number = num++;
      await week.save();
    }

    const total = finalWeeks.reduce((acc, w) => {
      const h = parseFloat(w.Week_Hours) || 0;
      const f = parseFloat(w.Week_Holiday) || 0;
      return acc + Math.max(0, h - f);
    }, 0);

    await Period.update({ Period_Total_Hours: total }, { where: { Period_ID: periodId } });

    return { weeks: finalWeeks, totalHours: total };
  }

  static async delete(id) {
    const week = await this.getById(id);
    if (!week) return null;

    await Weekly_Tracking.update(
      { Week_IsDeleted: true },
      { where: { Week_ID: id, Week_IsDeleted: false } }
    );

    return week;
  }
}
