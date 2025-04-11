import { HorarioController } from "../../controllers/schedule_controllers/Horario_Controller.js";
import { Router } from "express";

export const HorarioRouter = Router();

// 1. Obtener todos los horarios activos
HorarioRouter.get('/horarioEstudiantes', HorarioController.getHorarios);

// 2. Obtener la información completa para visualización (horarios unidos con datos de parámetros y usuario)
HorarioRouter.get('/horarioEstudiantes/completo', HorarioController.getHorariosCompletos);

// 3. Obtener la información completa para extracción (incluye horarios activos y eliminados)
// Si el parámetro "area" viene vacío, se retornan los horarios de todas las áreas.
HorarioRouter.get('/horarioEstudiantes/completo-extraccion', HorarioController.getHorariosCompletosExtraccion);

// 4. Obtener un horario específico por su ID
HorarioRouter.get('/horarioEstudiantes/:id', HorarioController.getById);

// 5. Consultar la disponibilidad para un día concreto (requiere periodoId, area y día)
HorarioRouter.get('/horarioEstudiantes/disponibilidad/:periodoId/:area/:dia', HorarioController.getDisponibilidadHorario);

// 6. Obtener todos los horarios asignados a un UsuarioXPeriodo (puede ser 1 o 2)
HorarioRouter.get('/horarioEstudiantes/usuarioxperiodo/:usuarioXPeriodoId', HorarioController.getHorariosByUsuarioXPeriodo);

// 7.  Obtener horarios completos activos por UsuarioXPeriodo_ID y modalidad (opcional)
HorarioRouter.get(
    '/horarioEstudiantes/completo/usuarioxperiodo/:usuarioXPeriodoId',
    HorarioController.getHorarioCompletoPorUsuarioXPeriodo
  );
  
// 8. Cambio administrativo: se eliminan lógicamente los horarios actuales y se crean nuevos (uno o dos)
HorarioRouter.post('/horarioEstudiantes/cambio-administrativo', HorarioController.cambioAdministrativo);

// 9. Crear un nuevo horario (para asignación individual)
HorarioRouter.post('/horarioEstudiantes', HorarioController.createHorario);

// 10. Actualizar un único horario (modifica únicamente el horario que se cambió)
HorarioRouter.put('/horarioEstudiantes/:id', HorarioController.update);

// 11. Eliminar (marcar como eliminado) un horario
HorarioRouter.delete('/horarioEstudiantes/:id', HorarioController.delete);
