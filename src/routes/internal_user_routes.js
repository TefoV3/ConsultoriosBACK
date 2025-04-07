import { InternalUserController } from "../controllers/InternalUserController.js";
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";

export const InternalUserRouter = Router();

InternalUserRouter.get('/internal-user', InternalUserController.getInternalUsers);
InternalUserRouter.get('/internal-user/:id', InternalUserController.getById);
InternalUserRouter.get('/internal-user/email/:email', InternalUserController.getByEmail);
InternalUserRouter.get('/internal-user/lawyers/list', InternalUserController.getAllLawyers);
InternalUserRouter.get('/internal-user/lawyers/actives/:area', InternalUserController.getAllActiveLawyers);
InternalUserRouter.post('/internal-user', InternalUserController.createInternalUser);
InternalUserRouter.put('/internal-user/:id', InternalUserController.update);
InternalUserRouter.delete('/internal-user/:id', InternalUserController.delete);
InternalUserRouter.get('/internal-users/students/:area', InternalUserController.getStudentsByArea);
InternalUserRouter.get('/internal-user/id-by-name/:firstName/:lastName', InternalUserController.getIdByNameAndLastName);

InternalUserRouter.get('/usuariointerno/estudiantes', InternalUserController.getInternalUserByTypeEstudiante);
InternalUserRouter.post('/usuariointernoBulk', InternalUserController.createInternalUsersBulk);
InternalUserRouter.put('/usuarios/actualizar-huella', InternalUserController.actualizarHuella);
InternalUserRouter.get('/usuarios/obtener-huella/:usuarioCedula', InternalUserController.obtenerHuella);





//AUTH ROUTES
InternalUserRouter.post('/register', InternalUserController.createInternalUser);
InternalUserRouter.post('/login', InternalUserController.login);
InternalUserRouter.post('/logout', InternalUserController.logout);
InternalUserRouter.post('/forgot-password', InternalUserController.requestResetPassword);
InternalUserRouter.post('/verify-code',InternalUserController.verifyCode);
InternalUserRouter.post('/reset-password',InternalUserController.resetPassword);
InternalUserRouter.post('/change-password',InternalUserController.changePassword);