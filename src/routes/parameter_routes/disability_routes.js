import { Router } from "express";
import { DisabilityController } from "../../controllers/parameter_controllers/DisabilityController.js";

export const DisabilityRouter = Router();

DisabilityRouter.get('/disability', DisabilityController.getAll);
DisabilityRouter.get('/disability/:id', DisabilityController.getById);
DisabilityRouter.post('/disability', DisabilityController.create);
DisabilityRouter.put('/disability/:id', DisabilityController.update);
DisabilityRouter.delete('/disability/:id', DisabilityController.delete);
