import cron from "node-cron";
import moment from "moment-timezone";
import { Op } from "sequelize";
import { ScheduleStudentsModel } from "../models/schedule_models/Schedule_StudentsModel.js";
import { Attendance_Record } from "../schemas/schedules_tables/Attendance_Record.js";
import { Alert } from "../schemas/schedules_tables/Alert.js";

cron.schedule("59 23 * * *", async () => {
  const now = moment().tz("America/Guayaquil");
  const today = now.format("YYYY-MM-DD"); // '2025-05-03'
  const dayOfWeek = now.format("dddd");   // 'Saturday'

  console.log(`📅 ${today} (${dayOfWeek}) - Revisando inasistencias totales...`);

  try {
    // 1. Obtener todos los horarios activos del período actual
    const horariosHoy = await ScheduleStudentsModel.getActiveSchedulesForToday(today);

    // 2. Agrupar por estudiante (Internal_ID)
    const studentsMap = new Map();

    for (const schedule of horariosHoy) {
      const key = schedule.Internal_ID;

      if (!studentsMap.has(key)) {
        studentsMap.set(key, {
          Internal_ID: schedule.Internal_ID,
          UserXPeriod_ID: schedule.UserXPeriod_ID,
          Internal_Name: schedule.Internal_Name,
          Internal_LastName: schedule.Internal_LastName,
          horarios: []
        });
      }

      const tipoDia = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1); // 'Monday'
      const startKey = `${tipoDia}_Start`;
      const endKey = `${tipoDia}_End`;

      if (schedule[startKey] && schedule[endKey]) {
        studentsMap.get(key).horarios.push({
          modo: schedule.Schedule_Mode,
          start: schedule[startKey],
          end: schedule[endKey]
        });
      }
    }

    // 3. Verificar asistencia para cada estudiante con horario hoy
    const startOfDay = now.clone().startOf("day").toDate();
    const endOfDay = now.clone().endOf("day").toDate();

    let totalAlertas = 0;

    for (const student of studentsMap.values()) {
      if (student.horarios.length === 0) continue; // No tenía horario ese día

      const registros = await Attendance_Record.findAll({
        where: {
          UserXPeriod_ID: student.UserXPeriod_ID,
          Attendance_IsDeleted: false,
          Attendance_Entry: { [Op.between]: [startOfDay, endOfDay] },
          Attendance_Exit: { [Op.ne]: null }
        }
      });

      if (registros.length === 0) {
        const horariosTexto = student.horarios
        .map(h => `${h.modo} de ${h.start} a ${h.end}`)
        .join(" y ");
      
      await Alert.create({
        Internal_ID: student.Internal_ID,
        Alert_Message: `No se registró ninguna asistencia el día de hoy. Tenías horario(s) ${horariosTexto}.`,
        Alert_Type: "Inasistencia",
        Alert_Approval_Status: "Pendiente",
        Alert_Date: new Date()
      });
        totalAlertas++;
      }
    }

    console.log(`✅ ${totalAlertas} alertas de inasistencia total generadas correctamente.`);
  } catch (error) {
    console.error("❌ Error generando alertas de inasistencia total:", error.message);
  }
}, {
  timezone: "America/Guayaquil"
});
