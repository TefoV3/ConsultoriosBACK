import { ZoneSectorModel } from "../../models/parameter_tables/ZoneSectorModel.js";

export class ZoneSectorController {

    static async getAll(req, res) {
        try {
            const data = await ZoneSectorModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await ZoneSectorModel.getById(id);
            if (!data) return res.status(404).json({ message: "Zone sector not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const newZoneSector = await ZoneSectorModel.create(req.body);
            res.status(201).json(newZoneSector);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedZoneSector = await ZoneSectorModel.update(id, req.body);
            if (!updatedZoneSector) return res.status(404).json({ message: "Zone sector not found or no changes made" });
            res.status(200).json(updatedZoneSector);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedZoneSector = await ZoneSectorModel.delete(id);
            if (!deletedZoneSector) return res.status(404).json({ message: "Zone sector not found" });
            res.status(200).json(deletedZoneSector);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
