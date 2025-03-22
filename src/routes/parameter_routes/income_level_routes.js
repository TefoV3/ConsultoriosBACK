import { Router } from "express";
import { IncomeLevelController } from "../../controllers/parameter_controllers/IncomeLevelController.js";

export const IncomeLevelRouter = Router();

IncomeLevelRouter.get('/niveldeingresos', IncomeLevelController.getAll);
IncomeLevelRouter.get('/niveldeingresos/:id', IncomeLevelController.getById);
IncomeLevelRouter.post('/niveldeingresos', IncomeLevelController.create);
IncomeLevelRouter.put('/niveldeingresos/:id', IncomeLevelController.update);
IncomeLevelRouter.delete('/niveldeingresos/:id', IncomeLevelController.delete);
