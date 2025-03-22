import { CountryModel } from "../../models/parameter_tables/CountryModel.js";

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
            const newCountry = await CountryModel.create(req.body);
            res.status(201).json(newCountry);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedCountry = await CountryModel.update(id, req.body);
            if (!updatedCountry) return res.status(404).json({ message: "Country not found or no changes made" });
            res.status(200).json(updatedCountry);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedCountry = await CountryModel.delete(id);
            if (!deletedCountry) return res.status(404).json({ message: "Country not found" });
            res.status(200).json(deletedCountry);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
