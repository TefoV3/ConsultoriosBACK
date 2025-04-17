import { HorarioController } from "../../controllers/schedule_controllers/Horario_Controller.js";
import { Router } from "express";

export const HorarioRouter = Router();

// 1. Obtener todos los horarios activos
HorarioRouter.get('/horarioEstudiantes', HorarioController.getHorarios);

// 2. Obtener la información completa para visualización
HorarioRouter.get('/horarioEstudiantes/completo', HorarioController.getHorariosCompletos);

// 3. Obtener información completa para extracción
HorarioRouter.get('/horarioEstudiantes/completo-extraccion', HorarioController.getHorariosCompletosExtraccion);

// ✅ 4. NUEVA RUTA: Obtener horarios completos por estudiante autenticado (Internal_ID)
HorarioRouter.get('/horarioEstudiantes/porEstudiante/:internalId', HorarioController.getHorariosCompletosPorEstudiante);

// 5. Obtener un horario específico por su ID
HorarioRouter.get('/horarioEstudiantes/:id', HorarioController.getById);

// 6. Consultar la disponibilidad para un día concreto
HorarioRouter.get('/horarioEstudiantes/disponibilidad/:periodoId/:area/:dia', HorarioController.getDisponibilidadHorario);

// 7. Obtener todos los horarios de un UsuarioXPeriodo
HorarioRouter.get('/horarioEstudiantes/usuarioxperiodo/:usuarioXPeriodoId', HorarioController.getHorariosByUsuarioXPeriodo);

// 8. Obtener horarios completos por UsuarioXPeriodo (opcional modalidad)
HorarioRouter.get('/horarioEstudiantes/completo/usuarioxperiodo/:usuarioXPeriodoId', HorarioController.getHorarioCompletoPorUsuarioXPeriodo);

// 9. Cambio administrativo
HorarioRouter.post('/horarioEstudiantes/cambio-administrativo', HorarioController.cambioAdministrativo);

// 10. Crear un nuevo horario
HorarioRouter.post('/horarioEstudiantes', HorarioController.createHorario);

// 11. Actualizar un horario
HorarioRouter.put('/horarioEstudiantes/:id', HorarioController.update);

// 12. Eliminar un horario
HorarioRouter.delete('/horarioEstudiantes/:id', HorarioController.delete);
