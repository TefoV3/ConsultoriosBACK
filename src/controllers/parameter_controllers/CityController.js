import { CityModel } from "../../models/parameter_models/CityModel.js";

export class CityController {

    static async getAll(req, res) {
        try {
            const data = await CityModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await CityModel.getById(id);
            if (!data) return res.status(404).json({ message: "City not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getByProvinceId(req, res) {
        try {
            const { provinceId } = req.params;
            const data = await CityModel.getByProvinceId(provinceId);
            if (!data) return res.status(404).json({ message: "City not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }





    static async create(req, res) {
        try {
            if (Array.isArray(req.body)) {
                const createdCity = await CityModel.bulkCreate(req.body);
                return res.status(201).json(createdCity);
            }
            // Si es un objeto, usa create normal
            const newCity = await CityModel.create(req.body);
            res.status(201).json(newCity);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedCity = await CityModel.update(id, req.body);
            if (!updatedCity) return res.status(404).json({ message: "City not found or no changes made" });
            res.status(200).json(updatedCity);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedCity = await CityModel.delete(id);
            if (!deletedCity) return res.status(404).json({ message: "City not found" });
            res.status(200).json(deletedCity);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
