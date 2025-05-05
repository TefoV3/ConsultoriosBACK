import { Schedule_StudentsController } from "../../controllers/schedule_controllers/Schedule_StudentsController.js";
import { Router } from "express";

export const ScheduleStudentsRouter = Router();


// 1. Obtener todos los horarios activos
ScheduleStudentsRouter.get('/horarioEstudiantes', Schedule_StudentsController.getAll);

// 2. Obtener información completa para visualización
ScheduleStudentsRouter.get('/horarioEstudiantes/completo', Schedule_StudentsController.getFullByPeriodAndArea);

// 3. Obtener información completa para extracción (sin filtrar por eliminados)
ScheduleStudentsRouter.get('/horarioEstudiantes/completo-extraccion', Schedule_StudentsController.getFullForExport);

// 4. Obtener horarios completos por estudiante (Internal_ID)
ScheduleStudentsRouter.get('/horarioEstudiantes/porEstudiante/:internalId', Schedule_StudentsController.getFullByStudent);

// 5. Obtener un horario por ID
ScheduleStudentsRouter.get('/horarioEstudiantes/:id', Schedule_StudentsController.getById);

// 6. Consultar la disponibilidad para un día
ScheduleStudentsRouter.get('/horarioEstudiantes/disponibilidad/:periodId/:area/:day', Schedule_StudentsController.getAvailability);

// 7. Obtener todos los horarios asignados a un UsuarioXPeriodo
ScheduleStudentsRouter.get('/horarioEstudiantes/usuarioxperiodo/:userXPeriodId', Schedule_StudentsController.getByUserXPeriod);

// 8. Obtener horarios completos por UsuarioXPeriodo (opcional: modalidad)
ScheduleStudentsRouter.get('/horarioEstudiantes/completo/usuarioxperiodo/:userXPeriodId', Schedule_StudentsController.getFullByUserXPeriod);

// 9. Cambio administrativo
ScheduleStudentsRouter.post('/horarioEstudiantes/cambio-administrativo', Schedule_StudentsController.adminChange);

// 10. Crear un nuevo horario
ScheduleStudentsRouter.post('/horarioEstudiantes', Schedule_StudentsController.create);

// 11. Actualizar un horario
ScheduleStudentsRouter.put('/horarioEstudiantes/:id', Schedule_StudentsController.update);

// 12. Eliminar (lógicamente) un horario
ScheduleStudentsRouter.delete('/horarioEstudiantes/:id', Schedule_StudentsController.delete);
