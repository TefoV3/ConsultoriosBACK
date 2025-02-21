import { UsuarioInternoController } from "../controllers/Usuario_internoController.js";
import { Router } from "express";

export const UsuarioInternoRouter = Router();

UsuarioInternoRouter.get('/usuariointerno', UsuarioInternoController.getUsuariosInternos);
UsuarioInternoRouter.get('/usuariointerno/:id', UsuarioInternoController.getById);
UsuarioInternoRouter.post('/usuariointerno', UsuarioInternoController.createUsuarioInterno);
UsuarioInternoRouter.put('/usuariointerno/:id', UsuarioInternoController.update);
UsuarioInternoRouter.delete('/usuariointerno/:id', UsuarioInternoController.delete);