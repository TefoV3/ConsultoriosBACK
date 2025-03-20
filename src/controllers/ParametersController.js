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
/*************************************************************************************************************************************/
    static async createProvince(req, res) {
        try {
            const { province } = req.body;
            const newRecord = await Parameters_model.create({ province });
            res.status(201).json({ message: "Province created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating province: ${error.message}` });
        }
    }
    static async getAllProvince(req, res) {
        try {
            const records = await Parameters_model.getAll();
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching provinces: ${error.message}` });
        }
    }
    static async updateProvince(req, res) {
        try {
            const { id } = req.params;
            const { province } = req.body;
            const result = await Parameters_model.update(id, { province });
            if (!result) {
                return res.status(404).json({ error: `Province with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating province with ID ${id}: ${error.message}` });
        }
    }
    static async deleteProvince(req, res) {
        try {
            const { id } = req.params;
            const result = await Parameters_model.delete(id);
            if (!result) {
                return res.status(404).json({ error: `Province with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting province with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createCity(req, res) {
        try {
            const { city } = req.body;
            const newRecord = await Parameters_model.createCity({ city });
            res.status(201).json({ message: "City created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating city: ${error.message}` });
        }
    }
    static async getAllCity(req, res) {
        try {
            const records = await Parameters_model.getAllCity();
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching cities: ${error.message}` });
        }
    }
    static async updateCity(req, res) {
        try {
            const { id } = req.params;
            const { city } = req.body;
            const result = await Parameters_model.updateCity(id, { city });
            if (!result) {
                return res.status(404).json({ error: `City with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating city with ID ${id}: ${error.message}` });
        }
    }
    static async deleteCity(req, res) {
        try {
            const { id } = req.params;
            const result = await Parameters_model.deleteCity(id);
            if (!result) {
                return res.status(404).json({ error: `City with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting city with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    
}
