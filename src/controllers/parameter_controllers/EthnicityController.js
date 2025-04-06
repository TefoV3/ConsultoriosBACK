import { EthnicityModel } from "../../models/parameter_models/EthnicityModel.js";

export class EthnicityController {

    static async getAll(req, res) {
        try {
            const data = await EthnicityModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await EthnicityModel.getById(id);
            if (!data) return res.status(404).json({ message: "Ethnicity not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            // Si el body es un array, usa bulkCreate
            if (Array.isArray(req.body)) {
                const createdEthnicities = await EthnicityModel.bulkCreate(req.body);
                return res.status(201).json(createdEthnicities);
            }
            // Si es un objeto, usa create normal
            const newEthnicity = await EthnicityModel.create(req.body);
            res.status(201).json(newEthnicity);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedEthnicity = await EthnicityModel.update(id, req.body);
            if (!updatedEthnicity) return res.status(404).json({ message: "Ethnicity not found or no changes made" });
            res.status(200).json(updatedEthnicity);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedEthnicity = await EthnicityModel.delete(id);
            if (!deletedEthnicity) return res.status(404).json({ message: "Ethnicity not found" });
            res.status(200).json(deletedEthnicity);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
