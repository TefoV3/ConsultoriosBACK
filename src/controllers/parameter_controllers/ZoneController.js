import { ZoneModel } from "../../models/parameter_tables/ZoneModel.js";

export class ZoneController {

    static async getAll(req, res) {
        try {
            const data = await ZoneModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await ZoneModel.getById(id);
            if (!data) return res.status(404).json({ message: "Zone sector not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const newZone = await ZoneModel.create(req.body);
            res.status(201).json(newZone);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedZone = await ZoneModel.update(id, req.body);
            if (!updatedZone) return res.status(404).json({ message: "Zone not found or no changes made" });
            res.status(200).json(updatedZone);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedZone = await ZoneModel.delete(id);
            if (!deletedZone) return res.status(404).json({ message: "Zone not found" });
            res.status(200).json(deletedZone);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
