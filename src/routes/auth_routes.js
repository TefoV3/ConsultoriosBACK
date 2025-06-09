import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { InternalUserModel } from '../models/InternalUserModel.js'; // Import the model
import { InternalUserController } from '../controllers/InternalUserController.js';
import { NumberOfAttemptsController } from "../controllers/parameter_controllers/NumberOfAttemptsController.js";

const router = express.Router();


// --- PUBLIC AUTH ROUTES ---
router.post('/register', InternalUserController.createInternalUser);
router.post('/login', InternalUserController.login);
router.post('/logout', InternalUserController.logout);
router.post('/forgot-password', InternalUserController.requestResetPassword);
router.post('/verify-code',InternalUserController.verifyCode);
router.post('/reset-password',InternalUserController.resetPassword);
router.post('/change-password',InternalUserController.changePassword);
router.get("/number-of-attempts/current", NumberOfAttemptsController.getCurrent);




// Endpoint para verificar la sesión del usuario
router.get('/api/me', authMiddleware, async (req, res) => { 
  // El middleware authMiddleware decodifica el token y guarda la info en req.user
  if (req.user && req.user.id) {
    try {
      //Obtener el usuario actual de la base de datos usando el ID del token
      const currentUser = await InternalUserModel.getById(req.user.id);

      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      //Retornamos la información del usuario actual en todo momento
      return res.json({
        id: currentUser.Internal_ID,
        name: currentUser.Internal_Name + ' ' + currentUser.Internal_LastName,
        email: currentUser.Internal_Email,
        type: currentUser.Internal_Type,
        profile: currentUser.Profile_ID, 
        area: currentUser.Internal_Area,
        phone: currentUser.Internal_Phone,
        status: currentUser.Internal_Status,
        picture: currentUser.Internal_Picture 
      });

    } catch (error) {
      console.error("Error fetching user data for /api/me:", error);
      return res.status(500).json({ message: 'Error retrieving user information' });
    }
  }
  // If req.user or req.user.id is not present after middleware, it's unauthorized
  return res.status(401).json({ message: 'No autorizado' });
});

export default router;