import { resumenHorasController } from "../../controllers/schedule_controllers/Resumen_Horas_Controller.js";
import { Router } from "express";

export const ResumenHorasRouter = Router();
// 🔹 Rutas más específicas primero
ResumenHorasRouter.get('/resumenHoras/completo', resumenHorasController.getAllResumen_Horas_Estudiantes);
ResumenHorasRouter.get('/resumenHoras/user/:id', resumenHorasController.getResumen_Horas_EstudiantesByUser);

// 🔹 Rutas genéricas después
ResumenHorasRouter.get('/resumenHoras', resumenHorasController.getResumen_Horas_Estudiantes);
ResumenHorasRouter.get('/resumenHoras/:id', resumenHorasController.getById);

ResumenHorasRouter.post('/resumenHoras', resumenHorasController.createResumen_Horas_Estudiantes);
ResumenHorasRouter.put('/resumenHoras/:id', resumenHorasController.update);
ResumenHorasRouter.delete('/resumenHoras/:id', resumenHorasController.delete);
