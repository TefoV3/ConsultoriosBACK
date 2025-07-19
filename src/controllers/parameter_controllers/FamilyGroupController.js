import { FamilyGroupModel } from "../../models/parameter_models/Family_GroupModel.js";

export class FamilyGroupController {

    static async getAll(req, res) {
        try {
            const FamilyGroup = await FamilyGroupModel.getAll();
            res.status(200).json(FamilyGroup);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const id = req.params.id;
            const FamilyGroup = await FamilyGroupModel.getById(id);
            if (!FamilyGroup) {
                res.status(404).json({ error: 'Family Group not found' });
            } else {
                res.status(200).json(FamilyGroup);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            if (Array.isArray(req.body)) {
                const createdDocumentation = await FamilyGroupModel.bulkCreate(req.body, internalId);
                return res.status(201).json(createdDocumentation);
            }
            // Si es un objeto, usa create normal
            const FamilyGroup = req.body;
            const newFamilyGroup = await FamilyGroupModel.create(FamilyGroup, internalId);
            res.status(201).json(newFamilyGroup);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const id = req.params.id;
            const updatedFamilyGroup = await FamilyGroupModel.update(id, req.body, internalId);
            if (!updatedFamilyGroup) {
                res.status(404).json({ error: 'Family Group not found' });
            } else {
                res.status(200).json(updatedFamilyGroup);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const id = req.params.id;
            const deletedFamilyGroup = await FamilyGroupModel.delete(id, internalId);
            if (!deletedFamilyGroup) {
                res.status(404).json({ error: 'Family Group not found' });
            } else {
                res.status(200).json(deletedFamilyGroup);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}