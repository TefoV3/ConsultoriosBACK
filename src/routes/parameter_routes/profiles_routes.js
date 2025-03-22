import { Router } from "express";
import { ProfilesController } from "../../controllers/parameter_controllers/ProfilesController.js";

export const ProfilesRouter = Router();

ProfilesRouter.get('/perfil', ProfilesController.getAll);
ProfilesRouter.get('/perfil/:id', ProfilesController.getById);
ProfilesRouter.post('/perfil', ProfilesController.create);
ProfilesRouter.put('/perfil/:id', ProfilesController.update);
ProfilesRouter.delete('/perfil/:id', ProfilesController.delete);