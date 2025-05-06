import { TypeOfActivityModel } from '../../models/parameter_models/Type_Of_ActivityModel.js';

export class TypeOfActivityController {

    static async getAll(req, res) {
        try {
            const TypeOfActivities = await TypeOfActivityModel.getAll();
            res.status(200).json(TypeOfActivities);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const TypeOfActivity = await TypeOfActivityModel.findById(req.params.id);
            res.status(200).json(TypeOfActivity);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    static async create(req, res) {
        try {
            if (Array.isArray(req.body)) {
                const createdTypeOfActivity = await TypeOfActivityModel.bulkCreate(req.body);
                return res.status(201).json(createdTypeOfActivity);
            }
            // Si es un objeto, usa create normal
            const newTypeOfActivity = await TypeOfActivityModel.create(req.body);
            res.status(201).json(newTypeOfActivity);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req, res) {
        try{
            const updatedTypeOfActivity = await TypeOfActivityModel.update(req.params.id, req.body);
            res.status(200).json(updatedTypeOfActivity);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            await TypeOfActivityModel.delete(req.params.id);
            res.status(204).end();
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}
    