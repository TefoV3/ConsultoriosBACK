import { VulnerableSituationModel } from "../../models/parameter_models/VulnerableSituationModel.js";

export class VulnerableSituationController {

    static async getAll(req, res) {
        try {
            const data = await VulnerableSituationModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const data = await VulnerableSituationModel.findById(req.params.id);
            res.status(200).json(data);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    static async create(req, res) {
        try {
            if (Array.isArray(req.body)) {
                const createdVulnerableSituation = await VulnerableSituationModel.bulkCreate(req.body);
                return res.status(201).json(createdVulnerableSituation);
            }
            // Si es un objeto, usa create normal
            const data = await VulnerableSituationModel.create(req.body);
            res.status(201).json(data);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req, res) {
        try{
            const data = await VulnerableSituationModel.update(req.params.id, req.body);
            if (!data) return res.status(404).json({ message: 'Vulnerable Situation not found' });
            res.status(200).json(data);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }   


    static async delete(req, res) {
        try {
            const data = await VulnerableSituationModel.delete(req.params.id);
            if (!data) return res.status(404).json({ message: 'Vulnerable Situation not found' });
            res.status(200).json({ message: 'Vulnerable Situation deleted successfully' });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}
   