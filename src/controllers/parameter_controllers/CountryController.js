import { CountryModel } from "../../models/parameter_models/CountryModel.js";

export class CountryController {

    static async getAll(req, res) {
        try {
            const data = await CountryModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            if (Array.isArray(req.body)) {
                const createdCountry = await CountryModel.bulkCreate(req.body);
                return res.status(201).json(createdCountry);
            }
            // Si es un objeto, usa create normal
            const { id } = req.params;
            const data = await CountryModel.getById(id);
            if (!data) return res.status(404).json({ message: "Country not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const newCountry = await CountryModel.create(req.body, internalId);
            res.status(201).json(newCountry);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const { id } = req.params;
            const updatedCountry = await CountryModel.update(id, req.body, internalId);
            if (!updatedCountry) return res.status(404).json({ message: "Country not found or no changes made" });
            res.status(200).json(updatedCountry);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const { id } = req.params;
            const deletedCountry = await CountryModel.delete(id, internalId);
            if (!deletedCountry) return res.status(404).json({ message: "Country not found" });
            res.status(200).json(deletedCountry);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
