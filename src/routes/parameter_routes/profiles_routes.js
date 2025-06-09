import { Router } from "express";
import { ProfilesController } from "../../controllers/parameter_controllers/ProfilesController.js";

export const ProfilesRouter = Router();

ProfilesRouter.get('/profile', ProfilesController.getAll);
ProfilesRouter.get('/profile/:id', ProfilesController.getById);
ProfilesRouter.post('/profile', ProfilesController.create);
ProfilesRouter.put('/profile/:id', ProfilesController.update);
ProfilesRouter.delete('/profile/:id', ProfilesController.delete);

