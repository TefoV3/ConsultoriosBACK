import { OccupationsModel } from "../../models/parameter_models/OccupationsModel.js";

export class OccupationsController {

    static async getAll(req, res) {
        try {
            const occupations = await OccupationsModel.getAll();
            res.status(200).json(occupations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const id = req.params.id;
            const occupation = await OccupationsModel.getById(id);
            if (!occupation) {
                res.status(404).json({ error: 'Occupations not found' });
            } else {
                res.status(200).json(occupation);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            if (Array.isArray(req.body)) {
                const createdoccupation = await OccupationsModel.bulkCreate(req.body);
                return res.status(201).json(createdoccupation);
            }
            // Si es un objeto, usa create normal
            const occupation = req.body;
            const newOccupation = await OccupationsModel.create(occupation);
            res.status(201).json(newOccupation);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const id = req.params.id;
            const updatedOccupation = await OccupationsModel.update(id, req.body);
            if (!updatedOccupation) {
                res.status(404).json({ error: 'Occupation not found' });
            } else {
                res.status(200).json(updatedOccupation);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const id = req.params.id;
            const deletedOccupation = await OccupationsModel.delete(id);
            if (!deletedOccupation) {
                res.status(404).json({ error: 'Occupations not found' });
            } else {
                res.status(200).json(deletedOccupation);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}