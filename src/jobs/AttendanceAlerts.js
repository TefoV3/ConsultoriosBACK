import cron from "node-cron";
import moment from "moment-timezone";
import { Attendance_RecordModel } from "../models/schedule_models/Attendance_RecordModel.js";
import { Alert } from "../schemas/schedules_tables/Alert.js";

cron.schedule("59 23 * * *", async () => {
  const now = moment().tz("America/Guayaquil").format("YYYY-MM-DD HH:mm:ss");
  console.log(`⏰ [${now}] Ejecutando alerta diaria de registros abiertos...`);

  try {
    const startOfDay = moment().tz("America/Guayaquil").startOf("day").toDate();
    const endOfDay = moment().tz("America/Guayaquil").endOf("day").toDate();
    
    const openRecords = await Attendance_RecordModel.getOpenRecordsWithUser({
      entryRange: [startOfDay, endOfDay]
    });


    for (const record of openRecords) {
      const internalUser = record.userXPeriod?.user;
      if (!internalUser) continue;

      const internalId = internalUser.Internal_ID;

         // Convertir a hora local Ecuador
         const horaEntradaLocal = moment(record.Attendance_Entry).tz("America/Guayaquil").format("HH:mm");


      await Alert.create({
        Internal_ID: internalId,
        Alert_Message: `Tienes un registro de asistencia abierto desde las ${horaEntradaLocal} sin salida. Por favor, revisa tu historial y avisa al administrador.`,
        Alert_Type: "Asistencia_Abierta",
        Alert_Approval_Status: "Pendiente",
        Alert_Date: new Date()
      });
    }

    console.log(`✅ Se generaron ${openRecords.length} alertas.`);
  } catch (error) {
    console.error("❌ Error generando alertas de registros abiertos:", error.message);
  }
}, {
  timezone: "America/Guayaquil"
});
