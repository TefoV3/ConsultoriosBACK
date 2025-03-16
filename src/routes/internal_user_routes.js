import { InternalUserController } from "../controllers/Internal_UserController.js";
import { Router } from "express";

export const InternalUserRouter = Router();

InternalUserRouter.get('/usuariointerno', InternalUserController.getInternalUsers);
InternalUserRouter.get('/usuariointerno/:id', InternalUserController.getById);
InternalUserRouter.post('/usuariointerno', InternalUserController.createInternalUser);
InternalUserRouter.put('/usuariointerno/:id', InternalUserController.update);
InternalUserRouter.delete('/usuariointerno/:id', InternalUserController.delete);