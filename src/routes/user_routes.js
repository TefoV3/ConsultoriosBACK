import { UserController } from "../controllers/UserController.js";
import { Router } from "express";

export const UserRouter = Router();

UserRouter.get('/usuario', UserController.getUsers);
UserRouter.get('/usuario/:id', UserController.getById);
UserRouter.post('/usuario', UserController.createUser);
UserRouter.put('/usuario/:id', UserController.update);
UserRouter.delete('/usuario/:id', UserController.delete);