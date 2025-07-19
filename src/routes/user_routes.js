import { UserController } from "../controllers/UserController.js";
import { Router } from "express";
import { upload } from "../middlewares/uploadMiddleware.js";
import { SocialWorkController } from "../controllers/SocialWorkController.js";

export const UserRouter = Router();

UserRouter.get('/user', UserController.getUsers);
UserRouter.get('/user/:id', UserController.getById);
UserRouter.get("/users/socialwork", SocialWorkController.getAllUsersWithSocialWork);
UserRouter.post('/user', UserController.createUser);
UserRouter.put("/user/:id", UserController.update);
UserRouter.delete('/user/:id', UserController.delete);

//Document Management
UserRouter.get('/user/document/:id', UserController.getDocumentById);
UserRouter.put('/user/document/:id', upload.single("healthDocuments"), UserController.uploadDocument);
UserRouter.delete('/user/document/:id', UserController.deleteDocument);