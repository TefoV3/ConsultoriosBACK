import { HorarioController } from "../../controllers/schedule_controllers/Horario_Controller.js";
import { Router } from "express";

export const HorarioRouter = Router();

// Obtener todos los horarios activos
HorarioRouter.get('/horarioEstudiantes', HorarioController.getHorarios);

// Obtener la información completa para visualización (horarios unidos con datos de parámetros y usuario)
HorarioRouter.get('/horarioEstudiantes/completo', HorarioController.getHorariosCompletos);

// Obtener un horario específico por su ID
HorarioRouter.get('/horarioEstudiantes/:id', HorarioController.getById);

// Obtener disponibilidad para un día concreto (requiere periodoId, area y día)
HorarioRouter.get('/horarioEstudiantes/disponibilidad/:periodoId/:area/:dia', HorarioController.getDisponibilidadHorario);

// Obtener todos los horarios asignados a un UsuarioXPeriodo (puede ser 1 o 2)
HorarioRouter.get('/horarioEstudiantes/usuarioxperiodo/:usuarioXPeriodoId', HorarioController.getHorariosByUsuarioXPeriodo);

// Cambio administrativo: se eliminan lógicamente los horarios actuales y se crean nuevos (1 o 2)
HorarioRouter.post('/horarioEstudiantes/cambio-administrativo', HorarioController.cambioAdministrativo);

// Crear un nuevo horario (para asignación individual)
HorarioRouter.post('/horarioEstudiantes', HorarioController.createHorario);

// Actualizar un único horario (modifica únicamente el horario que se cambió)
HorarioRouter.put('/horarioEstudiantes/:id', HorarioController.update);

// Eliminar (marcar como eliminado) un horario
HorarioRouter.delete('/horarioEstudiantes/:id', HorarioController.delete);
