import { OwnAssetsModel } from "../../models/parameter_models/OwnAssetsModel.js";

export class OwnAssetsController {

    static async getAll(req, res) {
        try {
            const OwnAssets = await OwnAssetsModel.getAll();
            res.status(200).json(OwnAssets);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const id = req.params.id;
            const OwnAssets = await OwnAssetsModel.getById(id);
            if (!OwnAssets) {
                res.status(404).json({ error: 'Own Assets not found' });
            } else {
                res.status(200).json(OwnAssets);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const OwnAssets = req.body;
            const newOwnAssets = await OwnAssetsModel.create(OwnAssets);
            res.status(201).json(newOwnAssets);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const id = req.params.id;
            const updatedOwnAssets = await OwnAssetsModel.update(id, req.body);
            if (!updatedOwnAssets) {
                res.status(404).json({ error: 'Own Assets not found' });
            } else {
                res.status(200).json(updatedOwnAssets);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const id = req.params.id;
            const deletedOwnAssets = await OwnAssetsModel.delete(id);
            if (!deletedOwnAssets) {
                res.status(404).json({ error: 'Own Assets not found' });
            } else {
                res.status(200).json(deletedOwnAssets);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}