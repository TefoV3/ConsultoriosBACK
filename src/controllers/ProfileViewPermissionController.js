import { ProfilePermissionModel } from '../models/ProfileViewPermissionModel.js';

export class ProfilePermissionController {
    // Método para obtener permisos de perfil
    static async getProfilePermissions(req, res) {
        try {
            const { profileId } = req.params;
            // Llama al método estático del modelo para obtener los datos
            const permissions = await ProfilePermissionModel.getByProfileId(profileId);
            res.json(permissions);
        } catch (error) {
            // Manejo de errores que puedan venir del modelo
            if (error.message.includes("Perfil no encontrado")) {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error interno del servidor al obtener permisos.' });
        }
    }

    // Método para actualizar permisos de perfil
    static async updateProfilePermissions(req, res) {
        try {
            const { profileId } = req.params;
            const permissionsData = req.body;
            const internalId = req.headers["internal-id"];
            
            // Llama al método estático del modelo para actualizar los datos
            const result = await ProfilePermissionModel.updateByProfileId(profileId, permissionsData, internalId);
            res.json(result);
        } catch (error) {
            // Manejo de errores que puedan venir del modelo
            if (error.message.includes("Perfil no encontrado")) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes("Administrador")) {
                 return res.status(403).json({ message: error.message });
            }
            if (error.message.includes("formato de datos es inválido")) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error interno del servidor al actualizar permisos.' });
        }
    }
}

