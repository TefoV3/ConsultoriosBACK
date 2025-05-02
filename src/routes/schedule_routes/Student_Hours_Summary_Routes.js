import { Student_Hours_SummaryController } from "../../controllers/schedule_controllers/Student_Hours_SummaryController.js";
import { Router } from "express";

export const StudentHoursSummaryRouter = Router();

/* 🔹 RUTAS MÁS ESPECÍFICAS */
// Obtener todos los resúmenes con los datos del estudiante
StudentHoursSummaryRouter.get('/resumenHoras/completo', Student_Hours_SummaryController.getAllWithStudents);

// Obtener el resumen junto con datos del estudiante por Internal_ID
StudentHoursSummaryRouter.get('/resumenHoras/conDatos/:id', Student_Hours_SummaryController.getWithUserDetails);

// NUEVA RUTA: Obtener el resumen con datos por cédula (Internal_ID)
StudentHoursSummaryRouter.get('/resumenHoras/porCedula/:id', Student_Hours_SummaryController.getByCedula);

// Obtener solo el resumen por usuario (Internal_ID), sin datos extra
StudentHoursSummaryRouter.get('/resumenHoras/user/:id', Student_Hours_SummaryController.getByUser);

/* 🔹 RUTAS GENERALES */
// Obtener todos los resúmenes sin datos del usuario
StudentHoursSummaryRouter.get('/resumenHoras', Student_Hours_SummaryController.getAll);

// Obtener un resumen por su ID interno
StudentHoursSummaryRouter.get('/resumenHoras/:id', Student_Hours_SummaryController.getById);

// Crear un nuevo resumen
StudentHoursSummaryRouter.post('/resumenHoras', Student_Hours_SummaryController.create);

// Actualizar un resumen existente
StudentHoursSummaryRouter.put('/resumenHoras/:id', Student_Hours_SummaryController.update);

// Eliminar (lógicamente) un resumen
StudentHoursSummaryRouter.delete('/resumenHoras/:id', Student_Hours_SummaryController.delete);
