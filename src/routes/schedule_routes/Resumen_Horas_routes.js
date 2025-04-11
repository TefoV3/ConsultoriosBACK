import { resumenHorasController } from "../../controllers/schedule_controllers/Resumen_Horas_Controller.js";
import { Router } from "express";

export const ResumenHorasRouter = Router();

// Rutas más específicas:
ResumenHorasRouter.get('/resumenHoras/completo', resumenHorasController.getAllResumen_Horas_Estudiantes);
// Ruta para obtener el resumen junto con los datos básicos del estudiante
ResumenHorasRouter.get('/resumenHoras/conDatos/:id', resumenHorasController.getResumenConDatosByUser);
// Ruta para obtener únicamente el resumen básico por usuario (Internal_ID)
ResumenHorasRouter.get('/resumenHoras/user/:id', resumenHorasController.getResumen_Horas_EstudiantesByUser);

// Rutas generales:
ResumenHorasRouter.get('/resumenHoras', resumenHorasController.getResumen_Horas_Estudiantes);
ResumenHorasRouter.get('/resumenHoras/:id', resumenHorasController.getById);

ResumenHorasRouter.post('/resumenHoras', resumenHorasController.createResumen_Horas_Estudiantes);
ResumenHorasRouter.put('/resumenHoras/:id', resumenHorasController.update);
ResumenHorasRouter.delete('/resumenHoras/:id', resumenHorasController.delete);
