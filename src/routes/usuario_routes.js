import { UserController } from "../controllers/UsuarioController.js";
import { Router } from "express";

export const UsuarioRouter = Router();

UsuarioRouter.get('/usuario', UserController.getUsers);
UsuarioRouter.get('/usuario/:id', UserController.getById);
UsuarioRouter.post('/usuario', UserController.createUser);
UsuarioRouter.put('/usuario/:id', UserController.update);
UsuarioRouter.delete('/usuario/:id', UserController.delete);