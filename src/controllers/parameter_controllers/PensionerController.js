import { PensionerModel } from "../../models/parameter_models/PensionerModel.js";

export class PensionerController {

    static async getAll(req, res) {
        try {
            const Pensioner = await PensionerModel.getAll();
            res.status(200).json(Pensioner);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const id = req.params.id;
            const Pensioner = await PensionerModel.getById(id);
            if (!Pensioner) {
                res.status(404).json({ error: 'Pensioner not found' });
            } else {
                res.status(200).json(Pensioner);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const Pensioner = req.body;
            const newPensioner = await PensionerModel.create(Pensioner);
            res.status(201).json(newPensioner);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const id = req.params.id;
            const updatedPensioner = await PensionerModel.update(id, req.body);
            if (!updatedPensioner) {
                res.status(404).json({ error: 'Pensioner not found' });
            } else {
                res.status(200).json(updatedPensioner);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const id = req.params.id;
            const deletedPensioner = await PensionerModel.delete(id);
            if (!deletedPensioner) {
                res.status(404).json({ error: 'Pensioner not found' });
            } else {
                res.status(200).json(deletedPensioner);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}