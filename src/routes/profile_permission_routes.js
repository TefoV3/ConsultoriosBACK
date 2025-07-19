import { Router } from "express";
import { ProfilePermissionController } from "../controllers/ProfileViewPermissionController.js"

export const ProfilePermissionRouter = Router();
// Rutas para obtener y actualizar permisos de perfil
ProfilePermissionRouter.get("/profile/auth/:profileId", ProfilePermissionController.getProfilePermissions);
ProfilePermissionRouter.put("/profile/auth/:profileId", ProfilePermissionController.updateProfilePermissions);
