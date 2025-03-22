import { Router } from "express";
import { ProtocolsController } from "../../controllers/parameter_controllers/ProtocolsController.js";

export const ProtocolsRouter = Router();

ProtocolsRouter.get('/protocolos', ProtocolsController.getAll);
ProtocolsRouter.get('/protocolos/:id', ProtocolsController.getById);
ProtocolsRouter.post('/protocolos', ProtocolsController.create);
ProtocolsRouter.put('/protocolos/:id', ProtocolsController.update);
ProtocolsRouter.delete('/protocolos/:id', ProtocolsController.delete);