import { CatastrophicIllnessModel } from '../../models/parameter_models/CatastrophicIllnessModel.js';

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
        const catastrophicIllness = req.body;
        const newCatastrophicIllness = new CatastrophicIllnessModel(catastrophicIllness);
        try {
            await newCatastrophicIllness.save();
            res.status(201).json(newCatastrophicIllness);
        } catch (error) {
            res.status(409).json({ message: error.message });
        }
    }

    static async update(req, res) {
        try {
            await CatastrophicIllnessModel.findByIdAndUpdate(req.params.id, req.body);
            res.status(200).json({ message: 'Catastrophic Illness updated successfully' });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            await CatastrophicIllnessModel.findByIdAndRemove(req.params.id);
            res.status(200).json({ message: 'Catastrophic Illness deleted successfully' });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}
    