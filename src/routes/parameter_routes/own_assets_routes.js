import { Router } from "express";
import { OwnAssetsController } from "../../controllers/parameter_controllers/OwnAssetsController.js";

export const OwnAssetsRouter = Router();

OwnAssetsRouter.get('/own-assets', OwnAssetsController.getAll);
OwnAssetsRouter.get('/own-assets/:id', OwnAssetsController.getById);
OwnAssetsRouter.post('/own-assets', OwnAssetsController.create);
OwnAssetsRouter.put('/own-assets/:id', OwnAssetsController.update);
OwnAssetsRouter.delete('/own-assets/:id', OwnAssetsController.delete);
