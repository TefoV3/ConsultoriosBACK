import { InternalUserController } from "../controllers/InternalUserController.js";
import { Router } from "express";

export const InternalUserRouter = Router();

InternalUserRouter.get('/usuariointerno', InternalUserController.getInternalUsers);
InternalUserRouter.get('/usuariointerno/:id', InternalUserController.getById);
InternalUserRouter.get('/usuariointerno/email/:email', InternalUserController.getByEmail);
InternalUserRouter.post('/usuariointerno', InternalUserController.createInternalUser);
InternalUserRouter.put('/usuariointerno/:id', InternalUserController.update);
InternalUserRouter.delete('/usuariointerno/:id', InternalUserController.delete);

//AUTH ROUTES
InternalUserRouter.post('/register', InternalUserController.createInternalUser);
InternalUserRouter.post('/login', InternalUserController.login);
InternalUserRouter.post('/logout', InternalUserController.logout);
InternalUserRouter.post('/forgot-password', InternalUserController.requestResetPassword);
InternalUserRouter.post('/verify-code',InternalUserController.verifyCode);
InternalUserRouter.post('/reset-password',InternalUserController.resetPassword);
InternalUserRouter.post('/change-password',InternalUserController.changePassword);