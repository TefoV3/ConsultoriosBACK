import { Router } from "express";
import { DisabilityController } from "../../controllers/parameter_controllers/DisabilityController.js";

export const DisabilityRouter = Router();

DisabilityRouter.get('/discapacidad', DisabilityController.getAll);
DisabilityRouter.get('/discapacidad/:id', DisabilityController.getById);
DisabilityRouter.post('/discapacidad', DisabilityController.create);
DisabilityRouter.put('/discapacidad/:id', DisabilityController.update);
DisabilityRouter.delete('/discapacidad/:id', DisabilityController.delete);
