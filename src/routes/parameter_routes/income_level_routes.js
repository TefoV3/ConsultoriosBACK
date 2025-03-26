import { Router } from "express";
import { IncomeLevelController } from "../../controllers/parameter_controllers/IncomeLevelController.js";

export const IncomeLevelRouter = Router();

IncomeLevelRouter.get('/income-level', IncomeLevelController.getAll);
IncomeLevelRouter.get('/income-level/:id', IncomeLevelController.getById);
IncomeLevelRouter.post('/income-level', IncomeLevelController.create);
IncomeLevelRouter.put('/income-level/:id', IncomeLevelController.update);
IncomeLevelRouter.delete('/income-level/:id', IncomeLevelController.delete);
