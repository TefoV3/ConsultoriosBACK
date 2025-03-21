import { ParametersModel } from "../models/ParametersModel.js";

export class ParametersController {
    static async getByZone(req, res) {
        try {
            const { zone } = req.params;

            if (!zone) {
                return res.status(400).json({ error: "Zone parameter is required." });
            }

            const sectors = await ParametersModel.getByZone(zone);
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
            const internalId = req.headers["internal-id"];  // ✅ Se obtiene el usuario interno desde los headers

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            if (!zone || !sector) {
                return res.status(400).json({ error: "Both 'zone' and 'sector' fields are required." });
            }

            const newParameter = await ParametersModel.create({ zone, sector }, internalId);
            res.status(201).json({ message: "Parameter created successfully.", data: newParameter });
        } catch (error) {
            res.status(500).json({ error: `Error creating parameter: ${error.message}` });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { zone, sector } = req.body;
            const internalId = req.headers["internal-id"];  // ✅ Se obtiene el usuario interno desde los headers

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            if (!zone || !sector) {
                return res.status(400).json({ error: "Both 'zone' and 'sector' fields are required." });
            }

            const updatedParameter = await ParametersModel.update(id, { zone, sector }, internalId);

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
            const internalId = req.headers["internal-id"];  // ✅ Se obtiene el usuario interno desde los headers

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            const result = await ParametersModel.delete(id, internalId);

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
        const internalId = req.headers["internal-id"]; // ✅ Obtener el usuario interno desde los headers

        if (!internalId) {
            return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
        }

        const newRecord = await ParametersModel.createProvince({ province }, internalId);
        res.status(201).json({ message: "Province created successfully.", data: newRecord });
    } catch (error) {
        res.status(500).json({ error: `Error creating province: ${error.message}` });
    }
}

static async getAllProvince(req, res) {
    try {
        const internalId = req.headers["internal-id"]; // ✅ Obtener el usuario interno desde los headers

        if (!internalId) {
            return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
        }

        const records = await ParametersModel.getAllProvince(internalId);
        if (!records) return res.status(404).json({ error: "No provinces found." });

        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ error: `Error fetching provinces: ${error.message}` });
    }
}

static async updateProvince(req, res) {
    try {
        const { id } = req.params;
        const { province } = req.body;
        const internalId = req.headers["internal-id"]; // ✅ Obtener el usuario interno desde los headers

        if (!internalId) {
            return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
        }

        const result = await ParametersModel.updateProvince(id, { province }, internalId);
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
        const internalId = req.headers["internal-id"]; // ✅ Obtener el usuario interno desde los headers

        if (!internalId) {
            return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
        }

        const result = await ParametersModel.deleteProvince(id, internalId);
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
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createCity({ city }, internalId);
            res.status(201).json({ message: "City created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating city: ${error.message}` });
        }
    }
    static async getAllCity(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllCity(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching cities: ${error.message}` });
        }
    }
    static async updateCity(req, res) {
        try {
            const { id } = req.params;
            const { city } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateCity(id, { city }, internalId);

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
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            const result = await ParametersModel.deleteCity(id, internalId);
            
            if (!result) {
                return res.status(404).json({ error: `City with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting city with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createCountry(req, res) {
        try {
            const { country } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            const newRecord = await ParametersModel.createCountry({ country }, internalId);
            
            res.status(201).json({ message: "Country created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating country: ${error.message}` });
        }
    }
    static async getAllCountry(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllCountry(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching countries: ${error.message}` });
        }
    }
    static async updateCountry(req, res) {
        try {
            const { id } = req.params;
            const { country } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateCountry(id, { country }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Country with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating country with ID ${id}: ${error.message}` });
        }
    }
    static async deleteCountry(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteCountry(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Country with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting country with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createEthnicity(req, res) {
        try {
            const { ethnicity } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createEthnicity({ ethnicity }, internalId);
            res.status(201).json({ message: "Ethnicity created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating ethnicity: ${error.message}` });
        }
    }
    static async getAllEthnicity(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllEthnicity(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching ethnicities: ${error.message}` });
        }
    }
    static async updateEthnicity(req, res) {
        try {
            const { id } = req.params;
            const { ethnicity } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateEthnicity(id, { ethnicity }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Ethnicity with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating ethnicity with ID ${id}: ${error.message}` });
        }
    }
    static async deleteEthnicity(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteEthnicity(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Ethnicity with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting ethnicity with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createMaritalStatus(req, res) {
        try {
            const { maritalStatus } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createMaritalStatus({ maritalStatus }, internalId);
            res.status(201).json({ message: "Marital status created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating marital status: ${error.message}` });
        }
    }
    static async getAllMaritalStatus(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllMaritalStatus(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching marital statuses: ${error.message}` });
        }
    }
    static async updateMaritalStatus(req, res) {
        try {
            const { id } = req.params;
            const { maritalStatus } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateMaritalStatus(id, { maritalStatus }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Marital status with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating marital status with ID ${id}: ${error.message}` });
        }
    }
    static async deleteMaritalStatus(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteMaritalStatus(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Marital status with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting marital status with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createGender(req, res) {
        try {
            const { gender } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createGender({ gender }, internalId);
            res.status(201).json({ message: "Gender created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating gender: ${error.message}` });
        }
    }
    static async getAllGender(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllGender(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching genders: ${error.message}` });
        }
    }
    static async updateGender(req, res) {
        try {
            const { id } = req.params;
            const { gender } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateGender(id, { gender }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Gender with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating gender with ID ${id}: ${error.message}` });
        }
    }
    static async deleteGender(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteGender(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Gender with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting gender with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createReferredBy(req, res) {
        try {
            const { referredBy } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createReferredBy({ referredBy }, internalId);
            res.status(201).json({ message: "ReferredBy created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating referredBy: ${error.message}` });
        }
    }
    static async getAllReferredBy(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllReferredBy(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching referredBy list: ${error.message}` });
        }
    }  
    static async updateReferredBy(req, res) {
        try {
            const { id } = req.params;
            const { referredBy } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateReferredBy(id, { referredBy }, internalId);
            if (!result) {
                return res.status(404).json({ error: `ReferredBy with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating referredBy with ID ${id}: ${error.message}` });
        }
    }
    static async deleteReferredBy(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteReferredBy(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `ReferredBy with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting referredBy with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createEducationLevel(req, res) {
        try {
            const { educationLevel } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createEducationLevel({ educationLevel }, internalId);
            res.status(201).json({ message: "Education level created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating education level: ${error.message}` });
        }
    }
    static async getAllEducationLevels(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllEducationLevels(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching education levels: ${error.message}` });
        }
    }
    static async updateEducationLevel(req, res) {
        try {
            const { id } = req.params;
            const { educationLevel } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateEducationLevel(id, { educationLevel }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Education level with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating education level with ID ${id}: ${error.message}` });
        }
    }
    static async deleteEducationLevel(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteEducationLevel(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Education level with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting education level with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createOccupation(req, res) {
        try {
            const { occupation } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createOccupation({ occupation }, internalId);
            res.status(201).json({ message: "Occupation created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating occupation: ${error.message}` });
        }
    }
    static async getAllOccupations(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllOccupations(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching occupations: ${error.message}` });
        }
    }
    static async updateOccupation(req, res) {
        try {
            const { id } = req.params;
            const { occupation } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateOccupation(id, { occupation }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Occupation with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating occupation with ID ${id}: ${error.message}` });
        }
    }
    static async deleteOccupation(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteOccupation(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Occupation with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting occupation with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createPersonalIncomeLevel(req, res) {
        try {
            const { personalIncomeLevel } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createPersonalIncomeLevel({ personalIncomeLevel }, internalId);
            res.status(201).json({ message: "Personal income level created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating personal income level: ${error.message}` });
        }
    }
    static async getAllPersonalIncomeLevels(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllPersonalIncomeLevels(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching personal income levels: ${error.message}` });
        }
    }
    static async updatePersonalIncomeLevel(req, res) {
        try {
            const { id } = req.params;
            const { personalIncomeLevel } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updatePersonalIncomeLevel(id, { personalIncomeLevel }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Personal income level with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating personal income level with ID ${id}: ${error.message}` });
        }
    }
    static async deletePersonalIncomeLevel(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deletePersonalIncomeLevel(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Personal income level with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting personal income level with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createFamilyGroup(req, res) {
        try {
            const { familyGroup } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createFamilyGroup({ familyGroup }, internalId);
            res.status(201).json({ message: "Family group created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating family group: ${error.message}` });
        }
    }
    static async getAllFamilyGroups(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllFamilyGroups(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching family groups: ${error.message}` });
        }
    }
    static async updateFamilyGroup(req, res) {
        try {
            const { id } = req.params;
            const { familyGroup } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateFamilyGroup(id, { familyGroup }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Family group with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating family group with ID ${id}: ${error.message}` });
        }
    }
    static async deleteFamilyGroup(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteFamilyGroup(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Family group with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting family group with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createFamilyIncome(req, res) {
        try {
            const { familyIncome } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createFamilyIncome({ familyIncome }, internalId);
            res.status(201).json({ message: "Family income created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating family income: ${error.message}` });
        }
    }
    static async getAllFamilyIncomes(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllFamilyIncomes(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching family incomes: ${error.message}` });
        }
    }
    static async updateFamilyIncome(req, res) {
        try {
            const { id } = req.params;
            const { familyIncome } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateFamilyIncome(id, { familyIncome }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Family income with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating family income with ID ${id}: ${error.message}` });
        }
    }
    static async deleteFamilyIncome(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteFamilyIncome(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Family income with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting family income with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createHousingType(req, res) {
        try {
            const { housingType } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createHousingType({ housingType }, internalId);
            res.status(201).json({ message: "Housing type created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating housing type: ${error.message}` });
        }
    }
    static async getAllHousingTypes(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllHousingTypes(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching housing types: ${error.message}` });
        }
    }
    static async updateHousingType(req, res) {
        try {
            const { id } = req.params;
            const { housingType } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateHousingType(id, { housingType }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Housing type with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating housing type with ID ${id}: ${error.message}` });
        }
    }
    static async deleteHousingType(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteHousingType(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Housing type with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting housing type with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createOwnAssets(req, res) {
        try {
            const { ownAssets } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createOwnAssets({ ownAssets }, internalId);
            res.status(201).json({ message: "Own assets created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating own assets: ${error.message}` });
        }
    }
    static async getAllOwnAssets(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllOwnAssets(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching own assets: ${error.message}` });
        }
    }
    static async updateOwnAssets(req, res) {
        try {
            const { id } = req.params;
            const { ownAssets } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateOwnAssets(id, { ownAssets },internalId);
            if (!result) {
                return res.status(404).json({ error: `Own assets with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating own assets with ID ${id}: ${error.message}` });
        }
    }
    static async deleteOwnAssets(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteOwnAssets(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Own assets with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting own assets with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createReceivesBonus(req, res) {
        try {
            const { receivesBonus } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createReceivesBonus({ receivesBonus }, internalId);
            res.status(201).json({ message: "Receives bonus created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating receives bonus: ${error.message}` });
        }
    }
    static async getAllReceivesBonuses(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllReceivesBonuses(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching receives bonuses: ${error.message}` });
        }
    }
    static async updateReceivesBonus(req, res) {
        try {
            const { id } = req.params;
            const { receivesBonus } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateReceivesBonus(id, { receivesBonus }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Receives bonus with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating receives bonus with ID ${id}: ${error.message}` });
        }
    }
    static async deleteReceivesBonus(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteReceivesBonus(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Receives bonus with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting receives bonus with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createPensioner(req, res) {
        try {
            const { pensioner } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createPensioner({ pensioner }, internalId);
            res.status(201).json({ message: "Pensioner created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating pensioner: ${error.message}` });
        }
    }
    static async getAllPensioners(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllPensioners(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching pensioners: ${error.message}` });
        }
    }
    static async updatePensioner(req, res) {
        try {
            const { id } = req.params;
            const { pensioner } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updatePensioner(id, { pensioner }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Pensioner with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating pensioner with ID ${id}: ${error.message}` });
        }
    }
    static async deletePensioner(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deletePensioner(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Pensioner with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting pensioner with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createHealthInsurance(req, res) {
        try {
            const { healthInsurance } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createHealthInsurance({ healthInsurance }, internalId);
            res.status(201).json({ message: "Health insurance created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating health insurance: ${error.message}` });
        }
    }
    static async getAllHealthInsurances(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllHealthInsurances(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching health insurances: ${error.message}` });
        }
    }
    static async updateHealthInsurance(req, res) {
        try {
            const { id } = req.params;
            const { healthInsurance } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateHealthInsurance(id, { healthInsurance }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Health insurance with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating health insurance with ID ${id}: ${error.message}` });
        }
    }
    static async deleteHealthInsurance(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteHealthInsurance(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Health insurance with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting health insurance with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createSupportDocuments(req, res) {
        try {
            const { supportDocuments } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createSupportDocuments({ supportDocuments }, internalId);
            res.status(201).json({ message: "Support documents created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating support documents: ${error.message}` });
        }
    }
    static async getAllSupportDocuments(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllSupportDocuments(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching support documents: ${error.message}` });
        }
    }
    static async updateSupportDocuments(req, res) {
        try {
            const { id } = req.params;
            const { supportDocuments } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateSupportDocuments(id, { supportDocuments }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Support documents with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating support documents with ID ${id}: ${error.message}` });
        }
    }
    static async deleteSupportDocuments(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteSupportDocuments(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Support documents with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting support documents with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createVulnerabilitySituation(req, res) {
        try {
            const { vulnerabilitySituation } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createVulnerabilitySituation({ vulnerabilitySituation }, internalId);
            res.status(201).json({ message: "Vulnerability situation created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating vulnerability situation: ${error.message}` });
        }
    }
    static async getAllVulnerabilitySituations(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllVulnerabilitySituations(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching vulnerability situations: ${error.message}` });
        }
    }
    static async updateVulnerabilitySituation(req, res) {
        try {
            const { id } = req.params;
            const { vulnerabilitySituation } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateVulnerabilitySituation(id, { vulnerabilitySituation }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Vulnerability situation with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating vulnerability situation with ID ${id}: ${error.message}` });
        }
    }
    static async deleteVulnerabilitySituation(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteVulnerabilitySituation(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Vulnerability situation with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting vulnerability situation with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createCatastrophicIllness(req, res) {
        try {
            const { catastrophicIllness } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createCatastrophicIllness({ catastrophicIllness }, internalId);
            res.status(201).json({ message: "Catastrophic illness created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating catastrophic illness: ${error.message}` });
        }
    }
    static async getAllCatastrophicIllnesses(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllCatastrophicIllnesses(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching catastrophic illnesses: ${error.message}` });
        }
    }
    static async updateCatastrophicIllness(req, res) {
        try {
            const { id } = req.params;
            const { catastrophicIllness } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateCatastrophicIllness(id, { catastrophicIllness }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Catastrophic illness with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating catastrophic illness with ID ${id}: ${error.message}` });
        }
    }
    static async deleteCatastrophicIllness(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteCatastrophicIllness(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Catastrophic illness with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting catastrophic illness with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
static async createDisability(req, res) {
    try {
        const { disability } = req.body;
        const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
        const newRecord = await ParametersModel.createDisability({ disability }, internalId);
        res.status(201).json({ message: "Disability created successfully.", data: newRecord });
    } catch (error) {
        res.status(500).json({ error: `Error creating disability: ${error.message}` });
    }
}
static async getAllDisabilities(req, res) {
    try {
        const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
        const records = await ParametersModel.getAllDisabilities(internalId);
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ error: `Error fetching disabilities: ${error.message}` });
    }
}
static async updateDisability(req, res) {
    try {
        const { id } = req.params;
        const { disability } = req.body;
        const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
        const result = await ParametersModel.updateDisability(id, { disability }, internalId);
        if (!result) {
            return res.status(404).json({ error: `Disability with ID ${id} not found.` });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: `Error updating disability with ID ${id}: ${error.message}` });
    }
}
static async deleteDisability(req, res) {
    try {
        const { id } = req.params;
        const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
        const result = await ParametersModel.deleteDisability(id, internalId);
        if (!result) {
            return res.status(404).json({ error: `Disability with ID ${id} not found.` });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: `Error deleting disability with ID ${id}: ${error.message}` });
    }
}
/*************************************************************************************************************************************/
    static async createProtocol(req, res) {
        try {
            const { protocol } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createProtocol({ protocol }, internalId);
            res.status(201).json({ message: "Protocol created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating protocol: ${error.message}` });
        }
    }
    static async getAllProtocols(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllProtocols(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching protocols: ${error.message}` });
        }
    }
    static async updateProtocol(req, res) {
        try {
            const { id } = req.params;
            const { protocol } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateProtocol(id, { protocol }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Protocol with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating protocol with ID ${id}: ${error.message}` });
        }
    }
    static async deleteProtocol(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteProtocol(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Protocol with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting protocol with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createAttachments(req, res) {
        try {
            const { attachments } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const newRecord = await ParametersModel.createAttachments({ attachments }, internalId);
            res.status(201).json({ message: "Attachments created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating attachments: ${error.message}` });
        }
    }
    static async getAllAttachments(req, res) {
        try {
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const records = await ParametersModel.getAllAttachments(internalId);
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching attachments: ${error.message}` });
        }
    }
    static async updateAttachments(req, res) {
        try {
            const { id } = req.params;
            const { attachments } = req.body;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.updateAttachments(id, { attachments }, internalId);
            if (!result) {
                return res.status(404).json({ error: `Attachments with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating attachments with ID ${id}: ${error.message}` });
        }
    }
    static async deleteAttachments(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const result = await ParametersModel.deleteAttachments(id, internalId);
            if (!result) {
                return res.status(404).json({ error: `Attachments with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting attachments with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createAttentionType(req, res) {
        try {
            const { attentionType } = req.body;
            const newRecord = await Parameters_model.createAttentionType({ attentionType });
            res.status(201).json({ message: "AttentionType created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating attentionType: ${error.message}` });
        }
    }
    static async getAllAttentionTypes(req, res) {
        try {
            const records = await Parameters_model.getAllAttentionTypes();
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching attentionTypes: ${error.message}` });
        }
    }
    static async updateAttentionType(req, res) {
        try {
            const { id } = req.params;
            const { attentionType } = req.body;
            const result = await Parameters_model.updateAttentionType(id, { attentionType });
            if (!result) {
                return res.status(404).json({ error: `AttentionType with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating attentionType with ID ${id}: ${error.message}` });
        }
    }
    static async deleteAttentionType(req, res) {
        try {
            const { id } = req.params;
            const result = await Parameters_model.deleteAttentionType(id);
            if (!result) {
                return res.status(404).json({ error: `AttentionType with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting attentionType with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createCaseStatus(req, res) {
        try {
            const { caseStatus } = req.body;
            const newRecord = await Parameters_model.createCaseStatus({ caseStatus });
            res.status(201).json({ message: "CaseStatus created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating caseStatus: ${error.message}` });
        }
    }
    static async getAllCaseStatuses(req, res) {
        try {
            const records = await Parameters_model.getAllCaseStatuses();
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching caseStatuses: ${error.message}` });
        }
    }
    static async updateCaseStatus(req, res) {
        try {
            const { id } = req.params;
            const { caseStatus } = req.body;
            const result = await Parameters_model.updateCaseStatus(id, { caseStatus });
            if (!result) {
                return res.status(404).json({ error: `CaseStatus with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating caseStatus with ID ${id}: ${error.message}` });
        }
    }
    static async deleteCaseStatus(req, res) {
        try {
            const { id } = req.params;
            const result = await Parameters_model.deleteCaseStatus(id);
            if (!result) {
                return res.status(404).json({ error: `CaseStatus with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting caseStatus with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
    static async createAreaTopic(req, res) {
        try {
            const { area, topic } = req.body;
            const { internalId } = req.user; // Obtener internalId de la sesión o del JWT
            const newRecord = await Parameters_model.createAreaTopic({ area, topic }, internalId);
            res.status(201).json({ message: "Area and Topic created successfully.", data: newRecord });
        } catch (error) {
            res.status(500).json({ error: `Error creating area and topic: ${error.message}` });
        }
    }
    static async getAllAreaTopics(req, res) {
        try {
            const records = await Parameters_model.getAllAreaTopics();
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ error: `Error fetching area and topic records: ${error.message}` });
        }
    }
    static async updateAreaTopic(req, res) {
        try {
            const { id } = req.params;
            const { area, topic } = req.body;
            const result = await Parameters_model.updateAreaTopic(id, { area, topic });
            if (!result) {
                return res.status(404).json({ error: `Area and Topic with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error updating area and topic with ID ${id}: ${error.message}` });
        }
    }
    static async deleteAreaTopic(req, res) {
        try {
            const { id } = req.params;
            const result = await Parameters_model.deleteAreaTopic(id);
            if (!result) {
                return res.status(404).json({ error: `Area and Topic with ID ${id} not found.` });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error deleting area and topic with ID ${id}: ${error.message}` });
        }
    }
/*************************************************************************************************************************************/
}
