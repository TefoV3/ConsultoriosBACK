import { ClientTypeModel } from '../../models/parameter_models/ClientTypeModel.js';

export class ClientTypeController {
    static async getAll(req, res) {
        try {
            const clientTypes = await ClientTypeModel.getAll();
            res.status(200).json(clientTypes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const clientType = await ClientTypeModel.getById(id);
            if (!clientType) return res.status(404).json({ message: 'Client Type not found' });
            res.status(200).json(clientType);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { Client_Type_Name } = req.body;
            if (!Client_Type_Name) return res.status(400).json({ message: 'Client Type Name is required' });

            const newClientType = await ClientTypeModel.create(req.body);
            res.status(201).json(newClientType);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { Client_Type_Name } = req.body;
            if (!Client_Type_Name) return res.status(400).json({ message: 'Client Type Name is required' });

            const updatedClientType = await ClientTypeModel.update(id, req.body);
            if (!updatedClientType) return res.status(404).json({ message: 'Client Type not found' });
            res.status(200).json(updatedClientType);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedClientType = await ClientTypeModel.delete(id);
            if (!deletedClientType) return res.status(404).json({ message: 'Client Type not found' });
            res.status(200).json(deletedClientType);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

}