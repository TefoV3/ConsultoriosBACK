import { UserController } from "../controllers/UserController.js";
import { Router } from "express";

export const UserRouter = Router();

UserRouter.get('/user', UserController.getUsers);
UserRouter.get('/user/:id', UserController.getById);
UserRouter.post('/user', UserController.createUser);
UserRouter.put('/user/:id', UserController.update);
UserRouter.delete('/user/:id', UserController.delete);