import { Registro_Asistencia_Controller } from "../../controllers/schedule_controllers/Registro_Asistencia_Controller.js";
import { Router } from "express";

export const Registro_Asistencias_Routes = Router();

// GET endpoints (rutas específicas primero)
Registro_Asistencias_Routes.get("/registros", Registro_Asistencia_Controller.getRegistros);
Registro_Asistencias_Routes.get("/registros/abierto", Registro_Asistencia_Controller.getRegistroAbierto);
Registro_Asistencias_Routes.get("/registrosAbiertos", Registro_Asistencia_Controller.getRegistrosAbiertos);
Registro_Asistencias_Routes.get("/registrosCerrados", Registro_Asistencia_Controller.getRegistrosCerrados);
Registro_Asistencias_Routes.get("/registros/:id", Registro_Asistencia_Controller.getById);

// POST endpoints
Registro_Asistencias_Routes.post("/registros/createConResumen", Registro_Asistencia_Controller.createAsistenciaWithResumen);
Registro_Asistencias_Routes.post("/registros", Registro_Asistencia_Controller.create);

// PUT endpoints
Registro_Asistencias_Routes.put("/registros/:id/salida", Registro_Asistencia_Controller.updateSalidaWithResumen);
Registro_Asistencias_Routes.put("/registrosCerrados/:id", Registro_Asistencia_Controller.updateCerradoConResumen);
Registro_Asistencias_Routes.put("/registros/:id", Registro_Asistencia_Controller.update);

// DELETE endpoints
Registro_Asistencias_Routes.delete("/registros/:id", Registro_Asistencia_Controller.delete);
// Nueva ruta para eliminar registro cerrado y ajustar resumen en la misma transacción:
Registro_Asistencias_Routes.delete("/registrosCerrados/:id/ajuste", Registro_Asistencia_Controller.deleteConAjuste);
