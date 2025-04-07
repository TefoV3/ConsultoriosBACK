import { DisabilityModel } from "../../models/parameter_models/DisabilityModel.js";

export class DisabilityController {

    static async getAll(req, res) {
        try {
            const disabilities = await DisabilityModel.getAll();
            res.status(200).json(disabilities);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            if (Array.isArray(req.body)) {
                const createddisability = await DisabilityModel.bulkCreate(req.body);
                return res.status(201).json(createddisability);
            }
            // Si es un objeto, usa create normal
            const id = req.params.id;
            const disability = await DisabilityModel.getById(id);
            if (!disability) {
                res.status(404).json({ error: 'Disability not found' });
            } else {
                res.status(200).json(disability);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const disability = req.body;
            const newDisability = await DisabilityModel.create(disability);
            res.status(201).json(newDisability);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const id = req.params.id;
            const updatedDisability = await DisabilityModel.update(id, req.body);
            if (!updatedDisability) {
                res.status(404).json({ error: 'Disability not found' });
            } else {
                res.status(200).json(updatedDisability);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const id = req.params.id;
            const deletedDisability = await DisabilityModel.delete(id);
            if (!deletedDisability) {
                res.status(404).json({ error: 'Disability not found' });
            } else {
                res.status(200).json(deletedDisability);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}