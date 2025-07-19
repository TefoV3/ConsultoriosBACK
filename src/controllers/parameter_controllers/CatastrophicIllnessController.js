import { intersection } from 'zod';
import { CatastrophicIllnessModel } from '../../models/parameter_models/Catastrophic_IllnessModel.js';

export class CatastrophicIllnessController {

    static async getAll(req, res) {
        try {
            const catastrophicIllnesses = await CatastrophicIllnessModel.getAll();
            res.status(200).json(catastrophicIllnesses);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const catastrophicIllness = await CatastrophicIllnessModel.findById(req.params.id);
            res.status(200).json(catastrophicIllness);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    static async create(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            if (Array.isArray(req.body)) {
                const createdCatastrophicIllness = await CatastrophicIllnessModel.bulkCreate(req.body, internalId);
                return res.status(201).json(createdCatastrophicIllness);
            }
            // Si es un objeto, usa create normal
            const newCatastrophicIllness = await CatastrophicIllnessModel.create(req.body, internalId);
            res.status(201).json(newCatastrophicIllness);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req, res) {
        try{
            const internalId = req.headers["internal-id"]
            const updatedCatastrophicIllness = await CatastrophicIllnessModel.update(req.params.id, req.body, internalId);
            res.status(200).json(updatedCatastrophicIllness);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            await CatastrophicIllnessModel.delete(req.params.id, internalId);
            res.status(204).end();
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }




}
    