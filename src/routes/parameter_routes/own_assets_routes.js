import { Router } from "express";
import { OwnAssetsController } from "../../controllers/parameter_controllers/OwnAssetsController.js";

export const OwnAssetsRouter = Router();

OwnAssetsRouter.get('/patrimoniopropio', OwnAssetsController.getAll);
OwnAssetsRouter.get('/patrimoniopropio/:id', OwnAssetsController.getById);
OwnAssetsRouter.post('/patrimoniopropio', OwnAssetsController.create);
OwnAssetsRouter.put('/patrimoniopropio/:id', OwnAssetsController.update);
OwnAssetsRouter.delete('/patrimoniopropio/:id', OwnAssetsController.delete);
