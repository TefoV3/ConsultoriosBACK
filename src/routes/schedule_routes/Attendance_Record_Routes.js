import { Attendance_Record_Controller } from "../../controllers/schedule_controllers/Attendance_RecordController.js";
import { Router } from "express";

export const AttendanceRecordRouter = Router();

// 🔹 GET endpoints
AttendanceRecordRouter.get("/registros", Attendance_Record_Controller.getAll);
AttendanceRecordRouter.get("/registros/abierto", Attendance_Record_Controller.getOpenRecord);
AttendanceRecordRouter.get("/registrosAbiertos", Attendance_Record_Controller.getOpenRecordsWithUser);
AttendanceRecordRouter.get("/registrosCerrados", Attendance_Record_Controller.getClosedRecords);
AttendanceRecordRouter.get("/registros/:id", Attendance_Record_Controller.getById);
AttendanceRecordRouter.get("/registros/virtual/completo", Attendance_Record_Controller.getCompletedVirtualRecord);

// 🔹 POST endpoints
AttendanceRecordRouter.post("/registros/createConResumen", Attendance_Record_Controller.createWithSummary);
AttendanceRecordRouter.post("/registros", Attendance_Record_Controller.create);

// 🔹 PUT endpoints
AttendanceRecordRouter.put("/registros/:id/salida", Attendance_Record_Controller.updateExitWithSummary);
AttendanceRecordRouter.put("/registrosCerrados/:id", Attendance_Record_Controller.updateClosedWithSummary);
AttendanceRecordRouter.put("/registros/:id", Attendance_Record_Controller.update);

// 🔹 DELETE endpoints
AttendanceRecordRouter.delete("/registros/:id", Attendance_Record_Controller.delete);
AttendanceRecordRouter.delete("/registrosCerrados/:id/ajuste", Attendance_Record_Controller.deleteWithAdjustment);
