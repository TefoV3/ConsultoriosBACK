import { TypeOfHousingModel } from "../../models/parameter_models/TypeOfHousingModel.js";

export class TypeOfHousingController {

    static async getAll(req, res) {
        try {
            const TypeOfHousing = await TypeOfHousingModel.getAll();
            res.status(200).json(TypeOfHousing);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const id = req.params.id;
            const TypeOfHousing = await TypeOfHousingModel.getById(id);
            if (!TypeOfHousing) {
                res.status(404).json({ error: 'Type Of Housing not found' });
            } else {
                res.status(200).json(TypeOfHousing);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            if (Array.isArray(req.body)) {
                const createdTypeOfHousing = await TypeOfHousingModel.bulkCreate(req.body);
                return res.status(201).json(createdTypeOfHousing);
            }
            // Si es un objeto, usa create normal
            const TypeOfHousing = req.body;
            const newTypeOfHousing = await TypeOfHousingModel.create(TypeOfHousing);
            res.status(201).json(newTypeOfHousing);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const id = req.params.id;
            const updatedTypeOfHousing = await TypeOfHousingModel.update(id, req.body);
            if (!updatedTypeOfHousing) {
                res.status(404).json({ error: 'Type Of Housing not found' });
            } else {
                res.status(200).json(updatedTypeOfHousing);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const id = req.params.id;
            const deletedTypeOfHousing = await TypeOfHousingModel.delete(id);
            if (!deletedTypeOfHousing) {
                res.status(404).json({ error: 'Type Of Housing not found' });
            } else {
                res.status(200).json(deletedTypeOfHousing);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}