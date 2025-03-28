import { HorarioController } from "../../controllers/schedule_controllers/Horario_Controller.js";

import { Router } from "express";

export const HorarioRouter = Router();

HorarioRouter.get('/horarioEstudiantes', HorarioController.getHorarios);
// Nueva ruta para obtener la información completa para visualización:
HorarioRouter.get('/horarioEstudiantes/completo', HorarioController.getHorariosCompletos);
HorarioRouter.get('/horarioEstudiantes/:id', HorarioController.getById);
HorarioRouter.get('/horarioEstudiantes/disponibilidad/:periodoId/:area/:dia', HorarioController.getDisponibilidadHorario);
HorarioRouter.get('/horarioEstudiantes/usuarioxperiodo/:usuarioXPeriodoId', HorarioController.getHorarioByUsuarioXPeriodo);
HorarioRouter.post('/horarioEstudiantes/cambio-administrativo', HorarioController.cambioAdministrativo);
HorarioRouter.post('/horarioEstudiantes', HorarioController.createHorario);
HorarioRouter.put('/horarioEstudiantes/:id', HorarioController.update);
HorarioRouter.delete('/horarioEstudiantes/:id', HorarioController.delete);
