// ✅ Controlador en inglés
import { UserXPeriodController } from "../../controllers/schedule_controllers/User_PeriodController.js";
import { Router } from "express";

export const UserXPeriodRouter = Router();

// 🔹 Rutas externas en español (se mantienen como están, pero los params están en inglés)

UserXPeriodRouter.get('/usuarioXPeriodo/periodo/:periodId/area/:area', UserXPeriodController.getByPeriodAndArea);
UserXPeriodRouter.get('/usuarioXPeriodo/periodo/:periodId', UserXPeriodController.getByPeriod);
UserXPeriodRouter.get('/usuarioXPeriodo/all', UserXPeriodController.getAllWithUsersAndPeriods);
UserXPeriodRouter.get('/usuarioXPeriodo/usuario/:internalId', UserXPeriodController.getByInternalId);

UserXPeriodRouter.get('/usuarioXPeriodo/:periodId/:internalId', UserXPeriodController.getById);
UserXPeriodRouter.get('/usuarioXPeriodo/id/:userXPeriodId', UserXPeriodController.getByUserXPeriodId);
UserXPeriodRouter.get('/usuarioXPeriodo', UserXPeriodController.getAll);
UserXPeriodRouter.post('/usuarioXPeriodo', UserXPeriodController.create);
UserXPeriodRouter.put('/usuarioXPeriodo/:periodId/:internalId', UserXPeriodController.update);
UserXPeriodRouter.delete('/usuarioXPeriodo/:periodId/:internalId', UserXPeriodController.delete);
