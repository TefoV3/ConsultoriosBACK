import { Router } from "express";
import { ZoneController } from "../../controllers/parameter_controllers/ZoneController.js";

export const  ZoneRouter = Router();

ZoneRouter.get('/zone',ZoneController.getAll)
ZoneRouter.get('/zone/:id',ZoneController.getById)
ZoneRouter.post('/zone',ZoneController.create)
ZoneRouter.put('/zone/:id',ZoneController.update)
ZoneRouter.delete('/zone/:id',ZoneController.delete)