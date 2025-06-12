import { intersection } from "zod";
import { ZoneModel } from "../../models/parameter_models/ZoneModel.js";

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
            const internalId = req.headers["internal-id"]
            // Si el body es un array, usa bulkCreate
            if (Array.isArray(req.body)) {
                const createdZones = await ZoneModel.bulkCreate(req.body, internalId);
                return res.status(201).json(createdZones);
            }
            // Si es un objeto, usa create normal
            const newZone = await ZoneModel.create(req.body, internalId);
            res.status(201).json(newZone);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const { id } = req.params;
            const updatedZone = await ZoneModel.update(id, req.body, internalId);
            if (!updatedZone) return res.status(404).json({ message: "Zone not found or no changes made" });
            res.status(200).json(updatedZone);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const { id } = req.params;
            const deletedZone = await ZoneModel.delete(id, internalId);
            if (!deletedZone) return res.status(404).json({ message: "Zone not found" });
            res.status(200).json(deletedZone);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
