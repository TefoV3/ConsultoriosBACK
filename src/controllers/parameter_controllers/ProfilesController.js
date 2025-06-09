import { ProfilesModel } from '../../models/parameter_models/ProfilesModel.js';
import { InternalUser } from '../../schemas/Internal_User.js';

export class ProfilesController {

    static async getAll(req, res) {
        try {
            const profiles = await ProfilesModel.getAll();
            return res.status(200).json(profiles);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const profile = await ProfilesModel.getById(req.params.id);
            if (!profile) return res.status(404).json({ error: 'Profile not found' });
            return res.status(200).json(profile);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            if (Array.isArray(req.body)) {
                const createdprofile = await ProfilesModel.bulkCreate(req.body);
                return res.status(201).json(createdprofile);
            }
            // Si es un objeto, usa create normal
            const profile = await ProfilesModel.create(req.body);
            return res.status(201).json(profile);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const profile = await ProfilesModel.update(req.params.id, req.body);
            if (!profile) return res.status(404).json({ error: 'Profile not found' });
            return res.status(200).json(profile);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

static async delete(req, res) {
        try {
            const profileId = req.params.id;

            // Verificar que no haya usuarios asociados al perfil antes de eliminarlo
            const associatedUsersCount = await InternalUser.count({
                where: { Profile_ID: profileId }
            });

            if (associatedUsersCount > 0) {
                return res.status(400).json({ error: 'No se puede eliminar el perfil porque tiene usuarios asociados.' });
            }

            // Si no hay usuarios asociados, procede a eliminar (marcar como inactivo) el perfil
            const profile = await ProfilesModel.delete(profileId);
            if (!profile) return res.status(404).json({ error: 'Perfil no encontrado o ya inactivo.' });
            
            // Devuelve un mensaje de éxito o el perfil actualizado
            return res.status(200).json({ message: 'Perfil eliminado (marcado como inactivo) correctamente.', profile });
        } catch (error) {
            // Considerar si el error es por perfil no encontrado o un error de servidor real
            if (error.message.includes("Error deleting profile")) { // O una comprobación más específica
                 console.error(`Error specific to profile deletion logic for ID ${req.params.id}:`, error.message);
            } else {
                console.error(`Generic error in delete profile for ID ${req.params.id}:`, error.message);
            }
            return res.status(500).json({ error: error.message });
        }
    }
}