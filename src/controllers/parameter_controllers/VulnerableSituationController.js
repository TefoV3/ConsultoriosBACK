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
            const data = await VulnerableSituationModel.create(req.body);
            res.status(201).json(data);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }



    static async update(req, res) {
        try {
            await VulnerableSituationModel.findByIdAndUpdate(req.params.id, req.body);
            res.status(204).end();
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            await VulnerableSituationModel.findByIdAndDelete(req.params.id);
            res.status(204).end();
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}
   