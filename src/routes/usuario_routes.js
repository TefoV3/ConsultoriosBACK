import { UsuarioController } from "../controllers/UsuarioController.js";
import { Router } from "express";

export const UsuarioRouter = Router();

UsuarioRouter.get('/usuario', UsuarioController.getUsuario);
UsuarioRouter.get('/usuario/:id', UsuarioController.getById);
UsuarioRouter.post('/usuario', UsuarioController.createUsuario);
UsuarioRouter.put('/usuario/:id', UsuarioController.update);
UsuarioRouter.delete('/usuario/:id', UsuarioController.delete);