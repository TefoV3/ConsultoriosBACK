import { Parameters } from "../schemas/Parameters.js";

export class Parameters_model {
    static async getByZone(zone) {
        try {
            return await Parameters.findAll({
                where: { zone },
                attributes: ["zone", "sector"],
            });
        } catch (error) {
            throw new Error(`Error retrieving sectors for zone ${zone}: ${error.message}`);
        }
    }
    static async create({ zone, sector }) {
        try {
            // Validar que se envíen únicamente zone y sector
            if (!zone || !sector) {
                throw new Error("Both 'zone' and 'sector' are required.");
            }

            // Crear el objeto con zone, sector y valores nulos para los demás campos
            const data = {
                zone,
                sector,
                province: null,
                city: null,
                country: null,
                ethnicity: null,
                maritalStatus: null,
                gender: null,
                referredBy: null,
                educationLevel: null,
                occupation: null,
                personalIncomeLevel: null,
                familyGroup: null,
                economicallyActivePersons: null,
                familyIncome: null,
                housingType: null,
                ownAssets: null,
                receivesBonus: null,
                pensioner: null,
                healthInsurance: null,
                supportDocuments: null,
                vulnerabilitySituation: null,
                catastrophicIllness: null,
                disability: null,
                disabilityPercentage: null,
                protocol: null,
                attachments: null,
                attentionType: null,
                caseStatus: null,
                area: null,
                topic: null,
            };

            // Insertar el registro
            return await Parameters.create(data);
        } catch (error) {
            throw new Error(`Error creating parameter: ${error.message}`);
        }
    }
    static async update(id, { zone, sector }) {
        try {
            if (!zone || !sector) {
                throw new Error("Both 'zone' and 'sector' are required for update.");
            }
            const data = {
                zone,
                sector,
            };
            const [rowsUpdated] = await Parameters.update(data, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return await Parameters.findByPk(id);
        } catch (error) {
            throw new Error(`Error updating parameter with id ${id}: ${error.message}`);
        }
    }
    static async delete(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });

            if (rowsDeleted === 0) return null;
            return { message: `Parameter with id ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting parameter with id ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
static async createProvince({ province }) {
    try {
        if (!province) {
            throw new Error("The 'province' field is required.");
        }

        // Crear el objeto con los valores por defecto
        const newRecord = await Parameters.create({
            province,
            zone: null,
            sector: null,
            city: null,
            country: null,
            ethnicity: null,
            maritalStatus: null,
            gender: null,
            referredBy: null,
            educationLevel: null,
            occupation: null,
            personalIncomeLevel: null,
            familyGroup: null,
            economicallyActivePersons: null,
            familyIncome: null,
            housingType: null,
            ownAssets: null,
            receivesBonus: null,
            pensioner: null,
            healthInsurance: null,
            supportDocuments: null,
            vulnerabilitySituation: null,
            catastrophicIllness: null,
            disability: null,
            disabilityPercentage: null,
            protocol: null,
            attachments: null,
            attentionType: null,
            caseStatus: null,
            area: null,
            topic: null,
        });

        return newRecord;
    } catch (error) {
        throw new Error(`Error creating province: ${error.message}`);
    }
    }
    static async getAllProvince() {
        try {
            const provinces = await Parameters.findAll({
                attributes: ['id', 'province'],
            });
            return provinces;
        } catch (error) {
            throw new Error(`Error fetching provinces: ${error.message}`);
        }
    }
    static async updateProvince(id, { province }) {
        try {
            if (!province) {
                throw new Error("The 'province' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ province }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Province with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating province with ID ${id}: ${error.message}`);
        }
    }
    static async deleteProvince(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Province with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting province with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createCity({ city }) {
        try {
            if (!city) {
                throw new Error("The 'city' field is required.");
            }

            // Crear el objeto con los valores por defecto
            const newRecord = await Parameters.create({
                city,
                zone: null,
                sector: null,
                province: null,
                country: null,
                ethnicity: null,
                maritalStatus: null,
                gender: null,
                referredBy: null,
                educationLevel: null,
                occupation: null,
                personalIncomeLevel: null,
                familyGroup: null,
                economicallyActivePersons: null,
                familyIncome: null,
                housingType: null,
                ownAssets: null,
                receivesBonus: null,
                pensioner: null,
                healthInsurance: null,
                supportDocuments: null,
                vulnerabilitySituation: null,
                catastrophicIllness: null,
                disability: null,
                disabilityPercentage: null,
                protocol: null,
                attachments: null,
                attentionType: null,
                caseStatus: null,
                area: null,
                topic: null,
            });

            return newRecord;
        } catch (error) {
            throw new Error(`Error creating city: ${error.message}`);
        }
    }
    static async getAllCity() {
        try {
            const cities = await Parameters.findAll({
                attributes: ['id', 'city'],
            });
            return cities;
        } catch (error) {
            throw new Error(`Error fetching cities: ${error.message}`);
        }
    }
    static async updateCity(id, { city }) {
        try {
            if (!city) {
                throw new Error("The 'city' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ city }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `City with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating city with ID ${id}: ${error.message}`);
        }
    }
    static async deleteCity(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `City with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting city with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    
}
