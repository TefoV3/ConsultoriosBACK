import { InternalUserController } from "../controllers/Usuario_internoController.js";
import { Router } from "express";

export const UsuarioInternoRouter = Router();

UsuarioInternoRouter.get('/usuariointerno', InternalUserController.getInternalUsers);
UsuarioInternoRouter.get('/usuariointerno/:id', InternalUserController.getById);
UsuarioInternoRouter.post('/usuariointerno', InternalUserController.createInternalUser);
UsuarioInternoRouter.put('/usuariointerno/:id', InternalUserController.update);
UsuarioInternoRouter.delete('/usuariointerno/:id', InternalUserController.delete);