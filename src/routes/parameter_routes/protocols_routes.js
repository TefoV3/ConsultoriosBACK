import { Router } from "express";
import { ProtocolsController } from "../../controllers/parameter_controllers/ProtocolsController.js";

export const ProtocolsRouter = Router();

ProtocolsRouter.get('/protocols', ProtocolsController.getAll);
ProtocolsRouter.get('/protocols/:id', ProtocolsController.getById);
ProtocolsRouter.post('/protocols', ProtocolsController.create);
ProtocolsRouter.put('/protocols/:id', ProtocolsController.update);
ProtocolsRouter.delete('/protocols/:id', ProtocolsController.delete);