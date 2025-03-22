import { ProtocolsModel } from "../../models/parameter_models/ProtocolsModel.js";

export class ProtocolsController {

    static async getAll(req, res) {
        try {
            const protocols = await ProtocolsModel.getAll();
            res.status(200).json(protocols);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const protocol = await ProtocolsModel.getById(req.params.id);
            if (protocol) res.status(200).json(protocol);
            else res.status(404).json({ message: "Protocol not found" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const protocol = await ProtocolsModel.create(req.body);
            res.status(201).json(protocol);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const protocol = await ProtocolsModel.update(req.params.id, req.body);
            if (protocol) res.status(200).json(protocol);
            else res.status(404).json({ message: "Protocol not found" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const protocol = await ProtocolsModel.delete(req.params.id);
            if (protocol) res.status(200).json(protocol);
            else res.status(404).json({ message: "Protocol not found" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}