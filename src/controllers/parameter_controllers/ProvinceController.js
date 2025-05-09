import { ProvinceModel } from "../../models/parameter_models/ProvinceModel.js";

export class ProvinceController {

    static async getAll(req, res) {
        try {
            const data = await ProvinceModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await ProvinceModel.getById(id);
            if (!data) return res.status(404).json({ message: "Province not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            if (Array.isArray(req.body)) {
                const createdProvince = await ProvinceModel.bulkCreate(req.body);
                return res.status(201).json(createdProvince);
            }
            // Si es un objeto, usa create normal
            const newProvince = await ProvinceModel.create(req.body);
            res.status(201).json(newProvince);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedProvince = await ProvinceModel.update(id, req.body);
            if (!updatedProvince) return res.status(404).json({ message: "Province not found or no changes made" });
            res.status(200).json(updatedProvince);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedProvince = await ProvinceModel.delete(id);
            if (!deletedProvince) return res.status(404).json({ message: "Province not found" });
            res.status(200).json(deletedProvince);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
