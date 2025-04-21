import { InternalUserController } from "../controllers/InternalUserController.js";
import { Router } from "express";
import upload from '../middlewares/multerImage.js';


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

//IMAGE UPLOAD ROUTE
InternalUserRouter.put(
    '/internal-users/profile-picture',         
    upload.single('profilePic'),      
    InternalUserController.uploadProfilePicture 
);