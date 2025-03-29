import { Registro_Asistencia_Controller } from "../../controllers/schedule_controllers/Registro_Asistencia_Controller.js";
import { Router } from "express";

export const Registro_Asistencias_Routes = Router();

Registro_Asistencias_Routes.get("/registros", Registro_Asistencia_Controller.getRegistros);
// Define primero la ruta específica para "abierto"
Registro_Asistencias_Routes.get("/registros/abierto", Registro_Asistencia_Controller.getRegistroAbierto);
// Luego la ruta genérica que captura cualquier valor en ":id"
Registro_Asistencias_Routes.get("/registros/:id", Registro_Asistencia_Controller.getById);

Registro_Asistencias_Routes.post("/registros", Registro_Asistencia_Controller.create);
Registro_Asistencias_Routes.put("/registros/:id", Registro_Asistencia_Controller.update);
Registro_Asistencias_Routes.delete("/registros/:id", Registro_Asistencia_Controller.delete);
