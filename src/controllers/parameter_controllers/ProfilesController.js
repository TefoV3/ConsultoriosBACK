import { ProfilesModel } from '../../models/parameter_models/ProfilesModel.js';

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
            const profile = await ProfilesModel.delete(req.params.id);
            if (!profile) return res.status(404).json({ error: 'Profile not found' });
            return res.status(200).json(profile);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}