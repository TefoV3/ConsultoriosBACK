import { Schedule_Students } from "../../schemas/schedules_tables/Schedule_Students.js";
import { sequelize } from "../../database/database.js";
import { QueryTypes } from "sequelize";
import { AuditModel } from "../AuditModel.js";
import { getUserId } from "../../sessionData.js";
import { InternalUser } from "../../schemas/Internal_User.js";
import { Period } from "../../schemas/schedules_tables/Period.js";
import { Parameter_Schedule } from "../../schemas/schedules_tables/Parameter_Schedule.js";
import { UserXPeriodModel } from "./User_PeriodModel.js";

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

// Helper function to get schedule details for audit
async function getScheduleDetails(scheduleData) {
  try {
    const details = {
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null
    };

    const dayFields = [
      { day: 'monday', field: scheduleData.Schedule_Day_Monday },
      { day: 'tuesday', field: scheduleData.Schedule_Day_Tuesday },
      { day: 'wednesday', field: scheduleData.Schedule_Day_Wednesday },
      { day: 'thursday', field: scheduleData.Schedule_Day_Thursday },
      { day: 'friday', field: scheduleData.Schedule_Day_Friday }
    ];

    for (const { day, field } of dayFields) {
      if (field) {
        try {
          const paramSchedule = await Parameter_Schedule.findOne({
            where: { Parameter_Schedule_ID: field },
            attributes: ["Parameter_Schedule_Start_Time", "Parameter_Schedule_End_Time", "Parameter_Schedule_Type"]
          });

          if (paramSchedule) {
            details[day] = {
              startTime: paramSchedule.Parameter_Schedule_Start_Time,
              endTime: paramSchedule.Parameter_Schedule_End_Time,
              type: paramSchedule.Parameter_Schedule_Type
            };
          }
        } catch (err) {
          console.warn(`Error obteniendo detalles del horario para ${day}:`, err.message);
        }
      }
    }

    return details;
  } catch (error) {
    console.warn("Error obteniendo detalles del horario:", error.message);
    return null;
  }
}

// Helper function to format schedule details for audit message
function formatScheduleForAudit(scheduleDetails, mode) {
  const dayNames = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes'
  };

  const activeDays = [];
  
  for (const [day, details] of Object.entries(scheduleDetails || {})) {
    if (details && details.startTime && details.endTime) {
      activeDays.push(`${dayNames[day]}: ${details.startTime} a ${details.endTime} (${details.type || 'Sin tipo'})`);
    }
  }

  const daysText = activeDays.length > 0 
    ? activeDays.join(', ') 
    : 'Sin horarios específicos';

  return `Modo: ${mode || 'Sin modo'} - Horarios: ${daysText}`;
}

// Helper function to get student and period information
async function getStudentAndPeriodInfo(userXPeriodId) {
  try {
    const userXPeriodRecord = await UserXPeriodModel.getByUserXPeriodId(userXPeriodId);
    
    if (!userXPeriodRecord) {
      return {
        studentName: 'Estudiante Desconocido',
        studentId: 'ID Desconocido',
        studentArea: 'Área no especificada',
        periodName: 'Período Desconocido',
        periodId: 'ID Desconocido'
      };
    }

    const studentName = userXPeriodRecord.user 
      ? `${userXPeriodRecord.user.Internal_Name} ${userXPeriodRecord.user.Internal_LastName}`
      : 'Estudiante Desconocido';
    
    const studentId = userXPeriodRecord.user?.Internal_ID || 'ID Desconocido';
    const studentArea = userXPeriodRecord.user?.Internal_Area || 'Área no especificada';
    const periodName = userXPeriodRecord.period?.Period_Name || 'Período Desconocido';
    const periodId = userXPeriodRecord.period?.Period_ID || 'ID Desconocido';

    return {
      studentName,
      studentId,
      studentArea,
      periodName,
      periodId
    };
  } catch (error) {
    console.warn("Error obteniendo información del estudiante y período:", error.message);
    return {
      studentName: 'Estudiante Desconocido',
      studentId: 'ID Desconocido',
      studentArea: 'Área no especificada',
      periodName: 'Período Desconocido',
      periodId: 'ID Desconocido'
    };
  }
}

export class ScheduleStudentsModel {
  // 1. Get all active schedules
  static async getAllSchedules() {
    try {
      return await Schedule_Students.findAll({
        where: { Schedule_IsDeleted: false },
      });
    } catch (error) {
      throw new Error(`Error fetching schedules: ${error.message}`);
    }
  }

  // 2. Get a schedule by ID
  static async getById(id) {
    try {
      return await Schedule_Students.findOne({
        where: { Schedule_Students_ID: id, Schedule_IsDeleted: false },
      });
    } catch (error) {
      throw new Error(`Error fetching schedule: ${error.message}`);
    }
  }

  // 3. Get all schedules assigned to a user-period
  static async getSchedulesByUserPeriod(userXPeriodId) {
    try {
      return await Schedule_Students.findAll({
        where: {
          UserXPeriod_ID: userXPeriodId,
          Schedule_IsDeleted: false,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching schedules by user-period: ${error.message}`);
    }
  }

  // 4. Get availability by day
  static async getAvailabilityByDay(periodId, area, day) {
    const columnMap = {
      Monday: "Schedule_Day_Monday",
      Tuesday: "Schedule_Day_Tuesday",
      Wednesday: "Schedule_Day_Wednesday",
      Thursday: "Schedule_Day_Thursday",
      Friday: "Schedule_Day_Friday",
    };

    const column = columnMap[day];
    console.log(column);
    if (!column) throw new Error(`Invalid day: ${day}`);

    const query = `
      SELECT 
        SUM(CASE WHEN ps.Parameter_Schedule_Type = 'Temprano' THEN 1 ELSE 0 END) AS cantidadTemprano,
        SUM(CASE WHEN ps.Parameter_Schedule_Type = 'Tarde' THEN 1 ELSE 0 END) AS cantidadTarde
      FROM ScheduleStudents s
      INNER JOIN UserXPeriods ux ON s.UserXPeriod_ID = ux.UserXPeriod_ID
      INNER JOIN Internal_Users u ON ux.Internal_ID = u.Internal_ID
      INNER JOIN Parameter_Schedules ps ON s.${column} = ps.Parameter_Schedule_ID
      WHERE 
        ux.Period_ID = :periodId
        AND u.Internal_Area = :area
        AND s.Schedule_Mode = 'Presencial'
        AND s.Schedule_IsDeleted = 0
    `;

    const [result] = await sequelize.query(query, {
      replacements: { periodId, area },
      type: QueryTypes.SELECT,
    });

    return result;
  }

  // 5. Create a new schedule
  static async create(data, internalUser) {
    const t = await sequelize.transaction(); // Start transaction
    try {
      const internalId = internalUser || getUserId();

      const newSchedule = await Schedule_Students.create(data, { transaction: t });

      // Get detailed information for audit
      const userInfo = await getUserInfo(internalId);
      const { studentName, studentId, studentArea, periodName, periodId } = await getStudentAndPeriodInfo(data.UserXPeriod_ID);
      const scheduleDetails = await getScheduleDetails(data);
      const scheduleText = formatScheduleForAudit(scheduleDetails, data.Schedule_Mode);

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "INSERT",
        "Schedule_Students",
        `${userInfo} creó un horario de estudiante ID ${newSchedule.Schedule_Students_ID} para ${studentName} (Cédula: ${studentId}, Área: ${studentArea}) en el período "${periodName}" (ID: ${periodId}) - ${scheduleText}`
      );

      await t.commit(); // Commit transaction
      return newSchedule;
    } catch (error) {
      await t.rollback(); // Rollback on error
      console.error("Error en ScheduleStudentsModel.create:", error);
      throw new Error(`Error creating schedule: ${error.message}`);
    }
  }

  // 6. Administrative change
  static async adminChange(userXPeriodId, newSchedules, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      const scheduleMode = newSchedules[0]?.Schedule_Mode; // ⬅️ obtener el modo actual
  
      // Get existing schedules for audit
      const existingSchedules = await Schedule_Students.findAll({
        where: {
          UserXPeriod_ID: userXPeriodId,
          Schedule_Mode: scheduleMode,
          Schedule_IsDeleted: false,
        },
        transaction: t,
      });

      // Get detailed information for audit
      const userInfo = await getUserInfo(internalId);
      const { studentName, studentId, studentArea, periodName, periodId } = await getStudentAndPeriodInfo(userXPeriodId);

      // Get old schedule details for audit
      let oldScheduleText = 'Sin horarios previos';
      if (existingSchedules.length > 0) {
        const oldScheduleDetails = await getScheduleDetails(existingSchedules[0]);
        oldScheduleText = formatScheduleForAudit(oldScheduleDetails, scheduleMode);
      }

      await Schedule_Students.update(
        { Schedule_IsDeleted: true },
        {
          where: {
            UserXPeriod_ID: userXPeriodId,
            Schedule_Mode: scheduleMode, // ✅ borrar solo el modo que se está cambiando
            Schedule_IsDeleted: false,
          },
          transaction: t,
        }
      );
  
      const createdScheduleIds = [];
      let newScheduleText = 'Sin horarios nuevos';
      
      for (const schedule of newSchedules) {
        const created = await Schedule_Students.create(
          {
            UserXPeriod_ID: userXPeriodId,
            Schedule_Day_Monday: schedule.Schedule_Day_Monday,
            Schedule_Day_Tuesday: schedule.Schedule_Day_Tuesday,
            Schedule_Day_Wednesday: schedule.Schedule_Day_Wednesday,
            Schedule_Day_Thursday: schedule.Schedule_Day_Thursday,
            Schedule_Day_Friday: schedule.Schedule_Day_Friday,
            Schedule_Mode: schedule.Schedule_Mode,
          },
          { transaction: t }
        );
        createdScheduleIds.push(created.Schedule_Students_ID);
      }

      // Get new schedule details for audit
      if (newSchedules.length > 0) {
        const newScheduleDetails = await getScheduleDetails(newSchedules[0]);
        newScheduleText = formatScheduleForAudit(newScheduleDetails, scheduleMode);
      }

      // Register detailed audit for administrative change
      const deletedIds = existingSchedules.map(s => s.Schedule_Students_ID).join(', ');
      const createdIds = createdScheduleIds.join(', ');
      
      await AuditModel.registerAudit(
        internalId,
        "UPDATE",
        "Schedule_Students",
        `${userInfo} realizó cambio administrativo de horario para ${studentName} (Cédula: ${studentId}, Área: ${studentArea}) en el período "${periodName}" (ID: ${periodId}) - Horarios eliminados [${deletedIds}]: ${oldScheduleText} → Horarios nuevos [${createdIds}]: ${newScheduleText}`
      );
  
      await t.commit();
      return { ok: true, message: "Administrative schedule change completed" };
    } catch (error) {
      await t.rollback();
      console.error("Error en ScheduleStudentsModel.adminChange:", error);
      throw new Error(`Error in administrative change: ${error.message}`);
    }
  }
  

  // 7. Update a schedule
  static async update(id, data, internalUser) {
    const t = await sequelize.transaction(); // Start transaction
    try {
      const internalId = internalUser || getUserId();
      const record = await this.getById(id);
      if (!record) return null;

      // Store original values for detailed comparison
      const originalData = {
        Schedule_Day_Monday: record.Schedule_Day_Monday,
        Schedule_Day_Tuesday: record.Schedule_Day_Tuesday,
        Schedule_Day_Wednesday: record.Schedule_Day_Wednesday,
        Schedule_Day_Thursday: record.Schedule_Day_Thursday,
        Schedule_Day_Friday: record.Schedule_Day_Friday,
        Schedule_Mode: record.Schedule_Mode,
        UserXPeriod_ID: record.UserXPeriod_ID
      };

      const [updated] = await Schedule_Students.update(data, {
        where: { Schedule_Students_ID: id, Schedule_IsDeleted: false },
        transaction: t,
      });

      if (updated) {
        // Get detailed information for audit
        const userInfo = await getUserInfo(internalId);
        const { studentName, studentId, studentArea, periodName, periodId } = await getStudentAndPeriodInfo(record.UserXPeriod_ID);

        // Get original schedule details
        const originalScheduleDetails = await getScheduleDetails(originalData);
        const originalScheduleText = formatScheduleForAudit(originalScheduleDetails, originalData.Schedule_Mode);

        // Get new schedule details
        const updatedScheduleData = { ...originalData, ...data };
        const newScheduleDetails = await getScheduleDetails(updatedScheduleData);
        const newScheduleText = formatScheduleForAudit(newScheduleDetails, updatedScheduleData.Schedule_Mode);

        // Build detailed change description
        let changeDetails = [];
        
        const dayFields = [
          { name: 'Lunes', old: originalData.Schedule_Day_Monday, new: data.Schedule_Day_Monday },
          { name: 'Martes', old: originalData.Schedule_Day_Tuesday, new: data.Schedule_Day_Tuesday },
          { name: 'Miércoles', old: originalData.Schedule_Day_Wednesday, new: data.Schedule_Day_Wednesday },
          { name: 'Jueves', old: originalData.Schedule_Day_Thursday, new: data.Schedule_Day_Thursday },
          { name: 'Viernes', old: originalData.Schedule_Day_Friday, new: data.Schedule_Day_Friday }
        ];

        for (const field of dayFields) {
          if (field.new !== undefined && field.new !== field.old) {
            changeDetails.push(`${field.name}: ID ${field.old || 'Sin horario'} → ID ${field.new || 'Sin horario'}`);
          }
        }

        if (data.Schedule_Mode !== undefined && data.Schedule_Mode !== originalData.Schedule_Mode) {
          changeDetails.push(`Modo: "${originalData.Schedule_Mode}" → "${data.Schedule_Mode}"`);
        }

        const changeDescription = changeDetails.length > 0 
          ? ` - Cambios específicos: ${changeDetails.join(', ')}` 
          : ' - Sin cambios detectados';

        // Register detailed audit
        await AuditModel.registerAudit(
          internalId,
          "UPDATE",
          "Schedule_Students",
          `${userInfo} actualizó el horario de estudiante ID ${id} para ${studentName} (Cédula: ${studentId}, Área: ${studentArea}) en el período "${periodName}" (ID: ${periodId})${changeDescription} - Horario anterior: ${originalScheduleText} → Horario nuevo: ${newScheduleText}`
        );

        await t.commit(); // Commit transaction
        return await this.getById(id);
      } else {
        await t.rollback();
        return null;
      }
    } catch (error) {
      await t.rollback(); // Rollback on error
      console.error("Error en ScheduleStudentsModel.update:", error);
      throw new Error(`Error updating schedule: ${error.message}`);
    }
  }

  // 8. Delete (soft) a schedule
  static async delete(id, internalUser) {
    const t = await sequelize.transaction(); // Start transaction
    try {
      const internalId = internalUser || getUserId();
      const record = await this.getById(id);
      if (!record) return null;

      // Get detailed information for audit before deletion
      const userInfo = await getUserInfo(internalId);
      const { studentName, studentId, studentArea, periodName, periodId } = await getStudentAndPeriodInfo(record.UserXPeriod_ID);
      
      // Get schedule details before deletion
      const scheduleDetails = await getScheduleDetails(record);
      const scheduleText = formatScheduleForAudit(scheduleDetails, record.Schedule_Mode);

      await Schedule_Students.update(
        { Schedule_IsDeleted: true },
        { 
          where: { Schedule_Students_ID: id, Schedule_IsDeleted: false },
          transaction: t,
        }
      );

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "DELETE",
        "Schedule_Students",
        `${userInfo} eliminó el horario de estudiante ID ${id} para ${studentName} (Cédula: ${studentId}, Área: ${studentArea}) en el período "${periodName}" (ID: ${periodId}) - Horario eliminado: ${scheduleText}`
      );

      await t.commit(); // Commit transaction
      return record;
    } catch (error) {
      await t.rollback(); // Rollback on error
      console.error("Error en ScheduleStudentsModel.delete:", error);
      throw new Error(`Error deleting schedule: ${error.message}`);
    }
  }

  // 9. Get full schedule by Internal_ID (student)
static async getFullScheduleByStudent(internalId) {
  try {
    const query = `
      SELECT 
        s.Schedule_Students_ID,
        s.UserXPeriod_ID,
        s.Schedule_Mode,
        s.Schedule_IsDeleted,
        s.createdAt,
        s.updatedAt,

        s.Schedule_Day_Monday,
        psL.Parameter_Schedule_Start_Time AS Monday_Start,
        psL.Parameter_Schedule_End_Time AS Monday_End,
        psL.Parameter_Schedule_Type AS Monday_Type,

        s.Schedule_Day_Tuesday,
        psT.Parameter_Schedule_Start_Time AS Tuesday_Start,
        psT.Parameter_Schedule_End_Time AS Tuesday_End,
        psT.Parameter_Schedule_Type AS Tuesday_Type,

        s.Schedule_Day_Wednesday,
        psW.Parameter_Schedule_Start_Time AS Wednesday_Start,
        psW.Parameter_Schedule_End_Time AS Wednesday_End,
        psW.Parameter_Schedule_Type AS Wednesday_Type,

        s.Schedule_Day_Thursday,
        psTh.Parameter_Schedule_Start_Time AS Thursday_Start,
        psTh.Parameter_Schedule_End_Time AS Thursday_End,
        psTh.Parameter_Schedule_Type AS Thursday_Type,

        s.Schedule_Day_Friday,
        psF.Parameter_Schedule_Start_Time AS Friday_Start,
        psF.Parameter_Schedule_End_Time AS Friday_End,
        psF.Parameter_Schedule_Type AS Friday_Type

      FROM ScheduleStudents s
      INNER JOIN UserXPeriods up ON s.UserXPeriod_ID = up.UserXPeriod_ID
      INNER JOIN Internal_Users u ON up.Internal_ID = u.Internal_ID

      LEFT JOIN Parameter_Schedules psL ON s.Schedule_Day_Monday = psL.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psT ON s.Schedule_Day_Tuesday = psT.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psW ON s.Schedule_Day_Wednesday = psW.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psTh ON s.Schedule_Day_Thursday = psTh.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psF ON s.Schedule_Day_Friday = psF.Parameter_Schedule_ID

      WHERE u.Internal_ID = :internalId AND s.Schedule_IsDeleted = false
      ORDER BY s.Schedule_Students_ID;
    `;

    return await sequelize.query(query, {
      replacements: { internalId },
      type: QueryTypes.SELECT,
    });
  } catch (error) {
    throw new Error(`Error retrieving full schedule by student: ${error.message}`);
  }
}

// 10. Get full schedules (no filter by Schedule_IsDeleted)
static async getAllFullSchedules(periodId, area = '') {
  try {
    let query = `
      SELECT 
        s.Schedule_Students_ID,
        s.UserXPeriod_ID,
        s.Schedule_Mode,
        s.Schedule_IsDeleted,
        s.createdAt,
        s.updatedAt,

        s.Schedule_Day_Monday,
        psL.Parameter_Schedule_Start_Time AS Monday_Start,
        psL.Parameter_Schedule_End_Time AS Monday_End,
        psL.Parameter_Schedule_Type AS Monday_Type,

        s.Schedule_Day_Tuesday,
        psT.Parameter_Schedule_Start_Time AS Tuesday_Start,
        psT.Parameter_Schedule_End_Time AS Tuesday_End,
        psT.Parameter_Schedule_Type AS Tuesday_Type,

        s.Schedule_Day_Wednesday,
        psW.Parameter_Schedule_Start_Time AS Wednesday_Start,
        psW.Parameter_Schedule_End_Time AS Wednesday_End,
        psW.Parameter_Schedule_Type AS Wednesday_Type,

        s.Schedule_Day_Thursday,
        psTh.Parameter_Schedule_Start_Time AS Thursday_Start,
        psTh.Parameter_Schedule_End_Time AS Thursday_End,
        psTh.Parameter_Schedule_Type AS Thursday_Type,

        s.Schedule_Day_Friday,
        psF.Parameter_Schedule_Start_Time AS Friday_Start,
        psF.Parameter_Schedule_End_Time AS Friday_End,
        psF.Parameter_Schedule_Type AS Friday_Type,

        u.Internal_ID,
        u.Internal_Name,
        u.Internal_LastName,
        u.Internal_Area

      FROM ScheduleStudents s
      INNER JOIN UserXPeriods up ON s.UserXPeriod_ID = up.UserXPeriod_ID
      INNER JOIN Internal_Users u ON up.Internal_ID = u.Internal_ID

      LEFT JOIN Parameter_Schedules psL ON s.Schedule_Day_Monday = psL.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psT ON s.Schedule_Day_Tuesday = psT.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psW ON s.Schedule_Day_Wednesday = psW.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psTh ON s.Schedule_Day_Thursday = psTh.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psF ON s.Schedule_Day_Friday = psF.Parameter_Schedule_ID

      WHERE up.Period_ID = :periodId
    `;

    const replacements = { periodId };

    if (area && area.trim() !== '') {
      query += ` AND u.Internal_Area = :area`;
      replacements.area = area;
    }

    query += ` ORDER BY s.Schedule_Students_ID`;

    return await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });
  } catch (error) {
    throw new Error(`Error retrieving all full schedules: ${error.message}`);
  }
}

// 11. Get full schedule by UserXPeriod_ID (optional mode)
static async getFullScheduleByUserXPeriod(userXPeriodId, mode = null) {
  try {
    let query = `
      SELECT 
        s.Schedule_Students_ID,
        s.UserXPeriod_ID,
        s.Schedule_Mode,
        s.Schedule_IsDeleted,
        s.createdAt,
        s.updatedAt,

        s.Schedule_Day_Monday,
        psL.Parameter_Schedule_Start_Time AS Monday_Start,
        psL.Parameter_Schedule_End_Time AS Monday_End,
        psL.Parameter_Schedule_Type AS Monday_Type,

        s.Schedule_Day_Tuesday,
        psT.Parameter_Schedule_Start_Time AS Tuesday_Start,
        psT.Parameter_Schedule_End_Time AS Tuesday_End,
        psT.Parameter_Schedule_Type AS Tuesday_Type,

        s.Schedule_Day_Wednesday,
        psW.Parameter_Schedule_Start_Time AS Wednesday_Start,
        psW.Parameter_Schedule_End_Time AS Wednesday_End,
        psW.Parameter_Schedule_Type AS Wednesday_Type,

        s.Schedule_Day_Thursday,
        psTh.Parameter_Schedule_Start_Time AS Thursday_Start,
        psTh.Parameter_Schedule_End_Time AS Thursday_End,
        psTh.Parameter_Schedule_Type AS Thursday_Type,

        s.Schedule_Day_Friday,
        psF.Parameter_Schedule_Start_Time AS Friday_Start,
        psF.Parameter_Schedule_End_Time AS Friday_End,
        psF.Parameter_Schedule_Type AS Friday_Type

      FROM ScheduleStudents s
      LEFT JOIN Parameter_Schedules psL ON s.Schedule_Day_Monday = psL.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psT ON s.Schedule_Day_Tuesday = psT.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psW ON s.Schedule_Day_Wednesday = psW.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psTh ON s.Schedule_Day_Thursday = psTh.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psF ON s.Schedule_Day_Friday = psF.Parameter_Schedule_ID

      WHERE s.UserXPeriod_ID = :userXPeriodId
    `;

    const replacements = { userXPeriodId };

    if (mode && mode.trim() !== '') {
      query += ` AND s.Schedule_Mode = :mode`;
      replacements.mode = mode;
    }

    query += ` ORDER BY s.Schedule_Students_ID`;

    return await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });
  } catch (error) {
    throw new Error(`Error retrieving schedule by UserXPeriod: ${error.message}`);
  }
}

static async getActiveSchedulesForToday(date) {
  try {
    const query = `
      SELECT 
        s.Schedule_Students_ID,
        s.UserXPeriod_ID,
        s.Schedule_Mode,
        s.Schedule_IsDeleted,
        s.createdAt,
        s.updatedAt,

        s.Schedule_Day_Monday,
        psL.Parameter_Schedule_Start_Time AS Monday_Start,
        psL.Parameter_Schedule_End_Time AS Monday_End,
        psL.Parameter_Schedule_Type AS Monday_Type,

        s.Schedule_Day_Tuesday,
        psT.Parameter_Schedule_Start_Time AS Tuesday_Start,
        psT.Parameter_Schedule_End_Time AS Tuesday_End,
        psT.Parameter_Schedule_Type AS Tuesday_Type,

        s.Schedule_Day_Wednesday,
        psW.Parameter_Schedule_Start_Time AS Wednesday_Start,
        psW.Parameter_Schedule_End_Time AS Wednesday_End,
        psW.Parameter_Schedule_Type AS Wednesday_Type,

        s.Schedule_Day_Thursday,
        psTh.Parameter_Schedule_Start_Time AS Thursday_Start,
        psTh.Parameter_Schedule_End_Time AS Thursday_End,
        psTh.Parameter_Schedule_Type AS Thursday_Type,

        s.Schedule_Day_Friday,
        psF.Parameter_Schedule_Start_Time AS Friday_Start,
        psF.Parameter_Schedule_End_Time AS Friday_End,
        psF.Parameter_Schedule_Type AS Friday_Type,

        u.Internal_ID,
        u.Internal_Name,
        u.Internal_LastName,
        u.Internal_Area,

        p.Period_ID,
        p.Period_Name

      FROM ScheduleStudents s
      INNER JOIN UserXPeriods up ON s.UserXPeriod_ID = up.UserXPeriod_ID
      INNER JOIN Internal_Users u ON up.Internal_ID = u.Internal_ID
      INNER JOIN Periods p ON up.Period_ID = p.Period_ID

      LEFT JOIN Parameter_Schedules psL ON s.Schedule_Day_Monday = psL.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psT ON s.Schedule_Day_Tuesday = psT.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psW ON s.Schedule_Day_Wednesday = psW.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psTh ON s.Schedule_Day_Thursday = psTh.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psF ON s.Schedule_Day_Friday = psF.Parameter_Schedule_ID

      WHERE s.Schedule_IsDeleted = false
        AND p.Period_IsDeleted = false
        AND :date BETWEEN p.Period_Start AND p.Period_End
      ORDER BY s.Schedule_Students_ID
    `;

    return await sequelize.query(query, {
      replacements: { date },
      type: QueryTypes.SELECT,
    });
  } catch (error) {
    throw new Error(`Error fetching active schedules for today: ${error.message}`);
  }
}




// 12. Get full schedule by student for export (ignore Schedule_IsDeleted)
static async getFullSchedulesForExport(periodId, area) {
  try {
    let query = `
      SELECT 
        s.Schedule_Students_ID,
        s.UserXPeriod_ID,
        s.Schedule_Mode,
        s.Schedule_IsDeleted,
        s.createdAt,
        s.updatedAt,

        s.Schedule_Day_Monday,
        psL.Parameter_Schedule_Start_Time AS Monday_Start,
        psL.Parameter_Schedule_End_Time AS Monday_End,
        psL.Parameter_Schedule_Type AS Monday_Type,

        s.Schedule_Day_Tuesday,
        psT.Parameter_Schedule_Start_Time AS Tuesday_Start,
        psT.Parameter_Schedule_End_Time AS Tuesday_End,
        psT.Parameter_Schedule_Type AS Tuesday_Type,

        s.Schedule_Day_Wednesday,
        psW.Parameter_Schedule_Start_Time AS Wednesday_Start,
        psW.Parameter_Schedule_End_Time AS Wednesday_End,
        psW.Parameter_Schedule_Type AS Wednesday_Type,

        s.Schedule_Day_Thursday,
        psTh.Parameter_Schedule_Start_Time AS Thursday_Start,
        psTh.Parameter_Schedule_End_Time AS Thursday_End,
        psTh.Parameter_Schedule_Type AS Thursday_Type,

        s.Schedule_Day_Friday,
        psF.Parameter_Schedule_Start_Time AS Friday_Start,
        psF.Parameter_Schedule_End_Time AS Friday_End,
        psF.Parameter_Schedule_Type AS Friday_Type,

        u.Internal_ID,
        u.Internal_Name,
        u.Internal_LastName,
        u.Internal_Area

      FROM ScheduleStudents s
      INNER JOIN UserXPeriods up ON s.UserXPeriod_ID = up.UserXPeriod_ID
      INNER JOIN Internal_Users u ON up.Internal_ID = u.Internal_ID

      LEFT JOIN Parameter_Schedules psL ON s.Schedule_Day_Monday = psL.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psT ON s.Schedule_Day_Tuesday = psT.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psW ON s.Schedule_Day_Wednesday = psW.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psTh ON s.Schedule_Day_Thursday = psTh.Parameter_Schedule_ID
      LEFT JOIN Parameter_Schedules psF ON s.Schedule_Day_Friday = psF.Parameter_Schedule_ID

      WHERE up.Period_ID = :periodId
    `;

    const replacements = { periodId };

    if (area && area.trim() !== '') {
      query += ` AND u.Internal_Area = :area`;
      replacements.area = area;
    }

    query += ` ORDER BY s.Schedule_Students_ID`;

    return await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });
  } catch (error) {
    throw new Error(`Error retrieving schedules for export: ${error.message}`);
  }
}


}