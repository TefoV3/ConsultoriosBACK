import { HealthInsuranceModel } from "../../models/parameter_models/HealthInsuranceModel.js";

export class HealthInsuranceController {

    static async getAll(req, res) {
        try {
            const HealthInsurance = await HealthInsuranceModel.getAll();
            res.status(200).json(HealthInsurance);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const id = req.params.id;
            const HealthInsurance = await HealthInsuranceModel.getById(id);
            if (!HealthInsurance) {
                res.status(404).json({ error: 'Health Insurance not found' });
            } else {
                res.status(200).json(HealthInsurance);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const HealthInsurance = req.body;
            const newHealthInsurance = await HealthInsuranceModel.create(HealthInsurance);
            res.status(201).json(newHealthInsurance);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const id = req.params.id;
            const updatedHealthInsurance = await HealthInsuranceModel.update(id, req.body);
            if (!updatedHealthInsurance) {
                res.status(404).json({ error: 'Health Insurance not found' });
            } else {
                res.status(200).json(updatedHealthInsurance);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const id = req.params.id;
            const deletedHealthInsurance = await HealthInsuranceModel.delete(id);
            if (!deletedHealthInsurance) {
                res.status(404).json({ error: 'Health Insurance not found' });
            } else {
                res.status(200).json(deletedHealthInsurance);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}