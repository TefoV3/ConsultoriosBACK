import { Parameters_model } from "../models/Parameters_model.js";

export class ParametersController {
    static async getByZone(req, res) {
        try {
            const { zone } = req.params;

            if (!zone) {
                return res.status(400).json({ error: "Zone parameter is required." });
            }

            const sectors = await Parameters_model.getByZone(zone);
            if (!sectors || sectors.length === 0) {
                return res.status(404).json({ message: `No sectors found for zone ${zone}.` });
            }

            res.status(200).json(sectors);
        } catch (error) {
            res.status(500).json({ error: `Error fetching sectors: ${error.message}` });
        }
    }
    static async create(req, res) {
        try {
            const { zone, sector } = req.body;

            if (!zone || !sector) {
                return res.status(400).json({ error: "Both 'zone' and 'sector' fields are required." });
            }

            const newParameter = await Parameters_model.create({ zone, sector });
            res.status(201).json({ message: "Parameter created successfully.", data: newParameter });
        } catch (error) {
            res.status(500).json({ error: `Error creating parameter: ${error.message}` });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { zone, sector } = req.body;
            if (!zone || !sector) {
                return res.status(400).json({ error: "Both 'zone' and 'sector' fields are required." });
            }

            const updatedParameter = await Parameters_model.update(id, { zone, sector });

            if (!updatedParameter) {
                return res.status(404).json({ error: `Parameter with ID ${id} not found.` });
            }
            res.status(200).json({ message: "Parameter updated successfully.", data: updatedParameter });
        } catch (error) {
            res.status(500).json({ error: `Error updating parameter: ${error.message}` });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;

            const result = await Parameters_model.delete(id);

            if (!result) {
                return res.status(404).json({ error: `Parameter with ID ${id} not found.` });
            }

            res.status(200).json({ message: `Parameter with ID ${id} deleted successfully.` });
        } catch (error) {
            res.status(500).json({ error: `Error deleting parameter: ${error.message}` });
        }
    }
}
