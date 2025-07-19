import { HealthInsuranceModel } from "../../models/parameter_models/Health_InsuranceModel.js";

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
            const internalId = req.headers["internal-id"]
            if (Array.isArray(req.body)) {
                const createdHealthInsurance = await HealthInsuranceModel.bulkCreate(req.body, internalId);
                return res.status(201).json(createdHealthInsurance);
            }
            // Si es un objeto, usa create normal
            const HealthInsurance = req.body;
            const newHealthInsurance = await HealthInsuranceModel.create(HealthInsurance, internalId);
            res.status(201).json(newHealthInsurance);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const id = req.params.id;
            const updatedHealthInsurance = await HealthInsuranceModel.update(id, req.body, internalId);
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
            const internalId = req.headers["internal-id"]
            const id = req.params.id;
            const deletedHealthInsurance = await HealthInsuranceModel.delete(id, internalId);
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