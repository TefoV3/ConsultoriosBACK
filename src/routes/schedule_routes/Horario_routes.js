import { HorarioController } from "../../controllers/schedule_controllers/Horario_Controller.js";

import { Router } from "express";

export const HorarioRouter = Router();

HorarioRouter.get('/horario', HorarioController.getHorarios);
// Nueva ruta para obtener la información completa para visualización:
HorarioRouter.get('/horario/completo', HorarioController.getHorariosCompletos);
HorarioRouter.get('/horario/:id', HorarioController.getById);
HorarioRouter.get('/horario/disponibilidad/:periodoId/:area/:dia', HorarioController.getDisponibilidadHorario);
HorarioRouter.get('/horario/usuarioxperiodo/:usuarioXPeriodoId', HorarioController.getHorarioByUsuarioXPeriodo);
HorarioRouter.post('/horario/cambio-administrativo', HorarioController.cambioAdministrativo);
HorarioRouter.post('/horario', HorarioController.createHorario);
HorarioRouter.put('/horario/:id', HorarioController.update);
HorarioRouter.delete('/horario/:id', HorarioController.delete);
