import { resumenHorasController } from "../../controllers/schedule_controllers/Resumen_Horas_Controller.js";
import { Router } from "express";

export const ResumenHorasRouter = Router();

/* 🔹 RUTAS MÁS ESPECÍFICAS */
// Obtener todos los resúmenes con los datos del estudiante
ResumenHorasRouter.get('/resumenHoras/completo', resumenHorasController.getAllResumen_Horas_Estudiantes);

// Obtener el resumen junto con datos del estudiante por Internal_ID
ResumenHorasRouter.get('/resumenHoras/conDatos/:id', resumenHorasController.getResumenConDatosByUser);

// NUEVA RUTA: Obtener el resumen con datos por cédula (Internal_ID)
ResumenHorasRouter.get('/resumenHoras/porCedula/:id', resumenHorasController.getResumenConEstudianteByCedula);

// Obtener solo el resumen por usuario (Internal_ID), sin datos extra
ResumenHorasRouter.get('/resumenHoras/user/:id', resumenHorasController.getResumen_Horas_EstudiantesByUser);

/* 🔹 RUTAS GENERALES */
// Obtener todos los resúmenes sin datos del usuario
ResumenHorasRouter.get('/resumenHoras', resumenHorasController.getResumen_Horas_Estudiantes);

// Obtener un resumen por su ID interno
ResumenHorasRouter.get('/resumenHoras/:id', resumenHorasController.getById);

// Crear un nuevo resumen
ResumenHorasRouter.post('/resumenHoras', resumenHorasController.createResumen_Horas_Estudiantes);

// Actualizar un resumen existente
ResumenHorasRouter.put('/resumenHoras/:id', resumenHorasController.update);

// Eliminar (lógicamente) un resumen
ResumenHorasRouter.delete('/resumenHoras/:id', resumenHorasController.delete);
