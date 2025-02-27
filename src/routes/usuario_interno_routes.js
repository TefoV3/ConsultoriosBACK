import { UsuarioInternoController } from "../controllers/Usuario_internoController.js";
import { ResetPasswordController } from '../controllers/ResetPasswordController.js';
import { Router } from "express";

export const UsuarioInternoRouter = Router();


UsuarioInternoRouter.get('/usuariointerno', UsuarioInternoController.getUsuariosInternos);
UsuarioInternoRouter.get('/usuariointerno/:id', UsuarioInternoController.getById);
UsuarioInternoRouter.put('/usuariointerno/:id', UsuarioInternoController.update);
UsuarioInternoRouter.delete('/usuariointerno/:id', UsuarioInternoController.delete);


UsuarioInternoRouter.post('/register', UsuarioInternoController.createUsuarioInterno);
UsuarioInternoRouter.post('/login', UsuarioInternoController.login);
UsuarioInternoRouter.post('/logout', UsuarioInternoController.logout);
UsuarioInternoRouter.post('/forgot-password', ResetPasswordController.requestResetPassword);
UsuarioInternoRouter.post('/verify-code',ResetPasswordController.verifyCode);
UsuarioInternoRouter.post('/reset-password',ResetPasswordController.resetPassword);
