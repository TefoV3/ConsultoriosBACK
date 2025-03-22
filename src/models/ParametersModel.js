import { Parameters } from "../schemas/Parameters.js";
import { AuditModel } from "./AuditModel.js";

export class ParametersModel {
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
    static async createZoneSector({ zone, sector }, internalId) {
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
            const newParameter = await Parameters.create(data);

            // 🔹 Registrar en Audit que un usuario interno creó un parámetro
            await AuditModel.registerAudit(
                internalId, 
                "INSERT",
                "Parameters",
                `El usuario interno ${internalId} creó un nuevo parámetro con ID ${newParameter.id}`
            );

            return newParameter;
        } catch (error) {
            throw new Error(`Error creating parameter: ${error.message}`);
        }
    }
    static async updateZoneSector(id, { zone, sector }, internalId) {
        try {
            if (!zone || !sector) {
                throw new Error("Both 'zone' and 'sector' are required for update.");
            }
            const data = { zone, sector };

            const [rowsUpdated] = await Parameters.update(data, { where: { id } });

            if (rowsUpdated === 0) return null;

            const updatedParameter = await Parameters.findByPk(id);

            // 🔹 Registrar en Audit que un usuario interno actualizó un parámetro
            await AuditModel.registerAudit(
                internalId, 
                "UPDATE",
                "Parameters",
                `El usuario interno ${internalId} actualizó el parámetro con ID ${id}`
            );

            return updatedParameter;
        } catch (error) {
            throw new Error(`Error updating parameter with id ${id}: ${error.message}`);
        }
    }
    static async deleteZoneSector(id, internalId) {
        try {
            const parameter = await Parameters.findByPk(id);
            if (!parameter) return null;

            await Parameters.destroy({ where: { id } });

            // 🔹 Registrar en Audit que un usuario interno eliminó un parámetro
            await AuditModel.registerAudit(
                internalId, 
                "DELETE",
                "Parameters",
                `El usuario interno ${internalId} eliminó el parámetro con ID ${id}`
            );

            return { message: `Parameter with id ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting parameter with id ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
static async createProvince({ province }, internalId) {
    try {
        if (!province) {
            throw new Error("The 'province' field is required.");
        }

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

        // 🔹 Registrar en Audit que un usuario interno creó una provincia
        await AuditModel.registerAudit(
            internalId, 
            "INSERT",
            "Parameters",
            `El usuario interno ${internalId} creó la provincia ${province} con ID ${newRecord.id}`
        );

        return newRecord;
    } catch (error) {
        throw new Error(`Error creating province: ${error.message}`);
    }
}

static async getAllProvince(internalId) {
    try {
        const provinces = await Parameters.findAll({
            attributes: ["id", "province"],
            where: {
                province: { [Op.ne]: null }, 
            },
        });

        if (provinces.length === 0) return null;

        // 🔹 Registrar en Audit que un usuario interno consultó todas las provincias
        await AuditModel.registerAudit(
            internalId, 
            "SELECT",
            "Parameters",
            `El usuario interno ${internalId} consultó todas las provincias registradas`
        );

        return provinces;
    } catch (error) {
        throw new Error(`Error fetching provinces: ${error.message}`);
    }
}

static async updateProvince(id, { province }, internalId) {
    try {
        if (!province) {
            throw new Error("The 'province' field is required.");
        }

        const parameter = await Parameters.findByPk(id);
        if (!parameter) return null;

        await Parameters.update({ province }, { where: { id } });

        // 🔹 Registrar en Audit que un usuario interno actualizó una provincia
        await AuditModel.registerAudit(
            internalId, 
            "UPDATE",
            "Parameters",
            `El usuario interno ${internalId} actualizó la provincia con ID ${id} a ${province}`
        );

        return { message: `Province with ID ${id} updated successfully.` };
    } catch (error) {
        throw new Error(`Error updating province with ID ${id}: ${error.message}`);
    }
}

static async deleteProvince(id, internalId) {
    try {
        const parameter = await Parameters.findByPk(id);
        if (!parameter) return null;

        await Parameters.destroy({ where: { id } });

        // 🔹 Registrar en Audit que un usuario interno eliminó una provincia
        await AuditModel.registerAudit(
            internalId, 
            "DELETE",
            "Parameters",
            `El usuario interno ${internalId} eliminó la provincia con ID ${id}`
        );

        return { message: `Province with ID ${id} deleted successfully.` };
    } catch (error) {
        throw new Error(`Error deleting province with ID ${id}: ${error.message}`);
    }
}
/************************************************************************************************************************************* */
static async createCity({ city }, internalId) {
    try {
        if (!city) {
            throw new Error("The 'city' field is required.");
        }

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

        // 🔹 Registrar en Audit que un usuario interno creó una ciudad
        await AuditModel.registerAudit(
            internalId,
            "INSERT",
            "Parameters",
            `El usuario interno ${internalId} creó la ciudad ${city} con ID ${newRecord.id}`
        );

        return newRecord;
    } catch (error) {
        throw new Error(`Error creating city: ${error.message}`);
    }
}

static async getAllCity(internalId) {
    try {
        const cities = await Parameters.findAll({
            attributes: ["id", "city"],
            where: {
                city: { [Op.ne]: null },
            },
        });

        if (cities.length === 0) return null;

        // 🔹 Registrar en Audit que un usuario interno consultó todas las ciudades
        await AuditModel.registerAudit(
            internalId,
            "SELECT",
            "Parameters",
            `El usuario interno ${internalId} consultó todas las ciudades registradas`
        );

        return cities;
    } catch (error) {
        throw new Error(`Error fetching cities: ${error.message}`);
    }
}

static async updateCity(id, { city }, internalId) {
    try {
        if (!city) {
            throw new Error("The 'city' field is required.");
        }

        const parameter = await Parameters.findByPk(id);
        if (!parameter) return null;

        await Parameters.update({ city }, { where: { id } });

        // 🔹 Registrar en Audit que un usuario interno actualizó una ciudad
        await AuditModel.registerAudit(
            internalId,
            "UPDATE",
            "Parameters",
            `El usuario interno ${internalId} actualizó la ciudad con ID ${id} a ${city}`
        );

        return { message: `City with ID ${id} updated successfully.` };
    } catch (error) {
        throw new Error(`Error updating city with ID ${id}: ${error.message}`);
    }
}

static async deleteCity(id, internalId) {
    try {
        const parameter = await Parameters.findByPk(id);
        if (!parameter) return null;

        await Parameters.destroy({ where: { id } });

        // 🔹 Registrar en Audit que un usuario interno eliminó una ciudad
        await AuditModel.registerAudit(
            internalId,
            "DELETE",
            "Parameters",
            `El usuario interno ${internalId} eliminó la ciudad con ID ${id}`
        );

        return { message: `City with ID ${id} deleted successfully.` };
    } catch (error) {
        throw new Error(`Error deleting city with ID ${id}: ${error.message}`);
    }
}
/************************************************************************************************************************************* */
static async createCountry({ country }, internalId) {
    try {
        if (!country) {
            throw new Error("The 'country' field is required.");
        }

        const newRecord = await Parameters.create({
            country,
            zone: null,
            sector: null,
            city: null,
            province: null,
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

        // 🔹 Registrar en Audit que un usuario interno creó un país
        await AuditModel.registerAudit(
            internalId,
            "INSERT",
            "Parameters",
            `El usuario interno ${internalId} creó el país ${country} con ID ${newRecord.id}`
        );

        return newRecord;
    } catch (error) {
        throw new Error(`Error creating country: ${error.message}`);
    }
}

static async getAllCountry(internalId) {
    try {
        const countries = await Parameters.findAll({
            attributes: ["id", "country"],
            where: {
                country: { [Op.ne]: null },
            },
        });

        if (countries.length === 0) return null;

        // 🔹 Registrar en Audit que un usuario interno consultó todos los países
        await AuditModel.registerAudit(
            internalId,
            "SELECT",
            "Parameters",
            `El usuario interno ${internalId} consultó todos los países registrados`
        );

        return countries;
    } catch (error) {
        throw new Error(`Error fetching countries: ${error.message}`);
    }
}

static async updateCountry(id, { country }, internalId) {
    try {
        if (!country) {
            throw new Error("The 'country' field is required.");
        }

        const parameter = await Parameters.findByPk(id);
        if (!parameter) return null;

        await Parameters.update({ country }, { where: { id } });

        // 🔹 Registrar en Audit que un usuario interno actualizó un país
        await AuditModel.registerAudit(
            internalId,
            "UPDATE",
            "Parameters",
            `El usuario interno ${internalId} actualizó el país con ID ${id} a ${country}`
        );

        return { message: `Country with ID ${id} updated successfully.` };
    } catch (error) {
        throw new Error(`Error updating country with ID ${id}: ${error.message}`);
    }
}

static async deleteCountry(id, internalId) {
    try {
        const parameter = await Parameters.findByPk(id);
        if (!parameter) return null;

        await Parameters.destroy({ where: { id } });

        // 🔹 Registrar en Audit que un usuario interno eliminó un país
        await AuditModel.registerAudit(
            internalId,
            "DELETE",
            "Parameters",
            `El usuario interno ${internalId} eliminó el país con ID ${id}`
        );

        return { message: `Country with ID ${id} deleted successfully.` };
    } catch (error) {
        throw new Error(`Error deleting country with ID ${id}: ${error.message}`);
    }
}
/************************************************************************************************************************************* */
    static async createEthnicity({ ethnicity }) {
        try {
            if (!ethnicity) {
                throw new Error("The 'ethnicity' field is required.");
            }

            // Crear el objeto con los valores por defecto
            const newRecord = await Parameters.create({
                ethnicity,
                province: null,
                zone: null,
                sector: null,
                city: null,
                country: null,
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
            throw new Error(`Error creating ethnicity: ${error.message}`);
        }
    }
    static async getAllEthnicity() {
        try {
            const ethnicities = await Parameters.findAll({
                attributes: ['id', 'ethnicity'],
                where: {
                    ethnicity: { [Op.ne]: null }, 
                },
            });
            return ethnicities;
        } catch (error) {
            throw new Error(`Error fetching ethnicities: ${error.message}`);
        }
    }    
    static async updateEthnicity(id, { ethnicity }) {
        try {
            if (!ethnicity) {
                throw new Error("The 'ethnicity' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ ethnicity }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Ethnicity with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating ethnicity with ID ${id}: ${error.message}`);
        }
    }
    static async deleteEthnicity(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Ethnicity with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting ethnicity with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
static async createMaritalStatus({ maritalStatus }) {
    try {
        if (!maritalStatus) {
            throw new Error("The 'maritalStatus' field is required.");
        }

        // Crear el objeto con los valores por defecto
        const newRecord = await Parameters.create({
            maritalStatus,
            province: null,
            zone: null,
            sector: null,
            city: null,
            country: null,
            ethnicity: null,
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
        throw new Error(`Error creating marital status: ${error.message}`);
    }
}
static async getAllMaritalStatus() {
    try {
        const maritalStatuses = await Parameters.findAll({
            attributes: ['id', 'maritalStatus'],
            where: {
                maritalStatus: {
                    [Op.ne]: null, // Filtra valores que no sean null
                },
            },
        });
        return maritalStatuses;
    } catch (error) {
        throw new Error(`Error fetching marital statuses: ${error.message}`);
    }
}
static async updateMaritalStatus(id, { maritalStatus }) {
    try {
        if (!maritalStatus) {
            throw new Error("The 'maritalStatus' field is required.");
        }
        const [rowsUpdated] = await Parameters.update({ maritalStatus }, {
            where: { id },
        });
        if (rowsUpdated === 0) return null;
        return { message: `Marital status with ID ${id} updated successfully.` };
    } catch (error) {
        throw new Error(`Error updating marital status with ID ${id}: ${error.message}`);
    }
}
static async deleteMaritalStatus(id) {
    try {
        const rowsDeleted = await Parameters.destroy({
            where: { id },
        });
        if (rowsDeleted === 0) return null;
        return { message: `Marital status with ID ${id} deleted successfully.` };
    } catch (error) {
        throw new Error(`Error deleting marital status with ID ${id}: ${error.message}`);
    }
}
/************************************************************************************************************************************* */
    static async createGender({ gender }) {
        try {
            if (!gender) {
                throw new Error("The 'gender' field is required.");
            }

            // Crear el objeto con los valores por defecto
            const newRecord = await Parameters.create({
                gender,
                province: null,
                zone: null,
                sector: null,
                city: null,
                country: null,
                ethnicity: null,
                maritalStatus: null,
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
            throw new Error(`Error creating gender: ${error.message}`);
        }
    }
    static async getAllGender() {
        try {
            const genders = await Parameters.findAll({
                attributes: ['id', 'gender'],
                where: {
                    gender: {
                        [Op.ne]: null, // Filtra valores que no sean null
                    },
                },
            });
            return genders;
        } catch (error) {
            throw new Error(`Error fetching genders: ${error.message}`);
        }
    }
    static async updateGender(id, { gender }) {
        try {
            if (!gender) {
                throw new Error("The 'gender' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ gender }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Gender with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating gender with ID ${id}: ${error.message}`);
        }
    }
    static async deleteGender(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Gender with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting gender with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createReferredBy({ referredBy }) {
        try {
            if (!referredBy) {
                throw new Error("The 'referredBy' field is required.");
            }

            // Crear el objeto con los valores por defecto
            const newRecord = await Parameters.create({
                referredBy,
                province: null,
                zone: null,
                sector: null,
                city: null,
                country: null,
                ethnicity: null,
                maritalStatus: null,
                gender: null,
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
            throw new Error(`Error creating referredBy: ${error.message}`);
        }
    }
    static async getAllReferredBy() {
        try {
            const referredByList = await Parameters.findAll({
                attributes: ['id', 'referredBy'],
                where: {
                    referredBy: {
                        [Op.ne]: null, // Filtra valores que no sean null
                    },
                },
            });
            return referredByList;
        } catch (error) {
            throw new Error(`Error fetching referredBy list: ${error.message}`);
        }
    }
    static async updateReferredBy(id, { referredBy }) {
        try {
            if (!referredBy) {
                throw new Error("The 'referredBy' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ referredBy }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `ReferredBy with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating referredBy with ID ${id}: ${error.message}`);
        }
    }
    static async deleteReferredBy(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `ReferredBy with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting referredBy with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createEducationLevel({ educationLevel }) {
        try {
            if (!educationLevel) {
                throw new Error("The 'educationLevel' field is required.");
            }

            const newRecord = await Parameters.create({
                educationLevel,
                province: null,
                zone: null,
                sector: null,
                city: null,
                country: null,
                ethnicity: null,
                maritalStatus: null,
                gender: null,
                referredBy: null,
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
            throw new Error(`Error creating education level: ${error.message}`);
        }
    }
    static async getAllEducationLevels() {
        try {
            const educationLevels = await Parameters.findAll({
                attributes: ['id', 'educationLevel'],
                where: {
                    educationLevel: { [Op.ne]: null }, 
                },
            });
            return educationLevels;
        } catch (error) {
            throw new Error(`Error fetching education levels: ${error.message}`);
        }
    }
    static async updateEducationLevel(id, { educationLevel }) {
        try {
            if (!educationLevel) {
                throw new Error("The 'educationLevel' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ educationLevel }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Education level with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating education level with ID ${id}: ${error.message}`);
        }
    }
    static async deleteEducationLevel(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Education level with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting education level with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createOccupation({ occupation }) {
        try {
            if (!occupation) {
                throw new Error("The 'occupation' field is required.");
            }
            const newRecord = await Parameters.create({
                occupation,
                province: null,
                zone: null,
                sector: null,
                city: null,
                country: null,
                ethnicity: null,
                maritalStatus: null,
                gender: null,
                referredBy: null,
                educationLevel: null,
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
            throw new Error(`Error creating occupation: ${error.message}`);
        }
    }
    static async getAllOccupations() {
        try {
            const occupations = await Parameters.findAll({
                attributes: ['id', 'occupation'],
                where: {
                    occupation: { [Op.ne]: null }, 
                },
            });
            return occupations;
        } catch (error) {
            throw new Error(`Error fetching occupations: ${error.message}`);
        }
    }
    static async updateOccupation(id, { occupation }) {
        try {
            if (!occupation) {
                throw new Error("The 'occupation' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ occupation }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Occupation with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating occupation with ID ${id}: ${error.message}`);
        }
    }
    static async deleteOccupation(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Occupation with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting occupation with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createPersonalIncomeLevel({ personalIncomeLevel }) {
        try {
            if (!personalIncomeLevel) {
                throw new Error("The 'personalIncomeLevel' field is required.");
            }

            const newRecord = await Parameters.create({
                personalIncomeLevel,
                province: null,
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
            throw new Error(`Error creating personal income level: ${error.message}`);
        }
    }
    static async getAllPersonalIncomeLevels() {
        try {
            const personalIncomeLevels = await Parameters.findAll({
                attributes: ['id', 'personalIncomeLevel'],
                where: {
                    personalIncomeLevel: { [Op.ne]: null }, 
                },
            });
            return personalIncomeLevels;
        } catch (error) {
            throw new Error(`Error fetching personal income levels: ${error.message}`);
        }
    }
    static async updatePersonalIncomeLevel(id, { personalIncomeLevel }) {
        try {
            if (!personalIncomeLevel) {
                throw new Error("The 'personalIncomeLevel' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ personalIncomeLevel }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Personal income level with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating personal income level with ID ${id}: ${error.message}`);
        }
    }
    static async deletePersonalIncomeLevel(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Personal income level with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting personal income level with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createFamilyGroup({ familyGroup }) {
        try {
            if (!familyGroup) {
                throw new Error("The 'familyGroup' field is required.");
            }

            const newRecord = await Parameters.create({
                familyGroup,
                province: null,
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
            throw new Error(`Error creating family group: ${error.message}`);
        }
    }
    static async getAllFamilyGroups() {
        try {
            const familyGroups = await Parameters.findAll({
                attributes: ['id', 'familyGroup'],
                where: {
                    familyGroup: { [Op.ne]: null }, 
                },
            });
            return familyGroups;
        } catch (error) {
            throw new Error(`Error fetching family groups: ${error.message}`);
        }
    }
    static async updateFamilyGroup(id, { familyGroup }) {
        try {
            if (!familyGroup) {
                throw new Error("The 'familyGroup' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ familyGroup }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Family group with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating family group with ID ${id}: ${error.message}`);
        }
    }
    static async deleteFamilyGroup(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Family group with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting family group with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createFamilyIncome({ familyIncome }) {
        try {
            if (!familyIncome) {
                throw new Error("The 'familyIncome' field is required.");
            }

            const newRecord = await Parameters.create({
                familyIncome,
                province: null,
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
            throw new Error(`Error creating family income: ${error.message}`);
        }
    }
    static async getAllFamilyIncomes() {
        try {
            const familyIncomes = await Parameters.findAll({
                attributes: ['id', 'familyIncome'],
                where: {
                    familyIncome: { [Op.ne]: null }, 
                },
            });
            return familyIncomes;
        } catch (error) {
            throw new Error(`Error fetching family incomes: ${error.message}`);
        }
    }
    static async updateFamilyIncome(id, { familyIncome }) {
        try {
            if (!familyIncome) {
                throw new Error("The 'familyIncome' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ familyIncome }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Family income with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating family income with ID ${id}: ${error.message}`);
        }
    }
    static async deleteFamilyIncome(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Family income with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting family income with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createHousingType({ housingType }) {
        try {
            if (!housingType) {
                throw new Error("The 'housingType' field is required.");
            }

            const newRecord = await Parameters.create({
                housingType,
                province: null,
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
            throw new Error(`Error creating housing type: ${error.message}`);
        }
    }
    static async getAllHousingTypes() {
        try {
            const housingTypes = await Parameters.findAll({
                attributes: ['id', 'housingType'],
                where: {
                    housingType: { [Op.ne]: null }, 
                },
            });
            return housingTypes;
        } catch (error) {
            throw new Error(`Error fetching housing types: ${error.message}`);
        }
    }
    static async updateHousingType(id, { housingType }) {
        try {
            if (!housingType) {
                throw new Error("The 'housingType' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ housingType }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Housing type with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating housing type with ID ${id}: ${error.message}`);
        }
    }
    static async deleteHousingType(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Housing type with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting housing type with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createOwnAssets({ ownAssets }) {
        try {
            if (!ownAssets) {
                throw new Error("The 'ownAssets' field is required.");
            }

            const newRecord = await Parameters.create({
                ownAssets,
                province: null,
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
            throw new Error(`Error creating own assets: ${error.message}`);
        }
    }
    static async getAllOwnAssets() {
        try {
            const ownAssets = await Parameters.findAll({
                attributes: ['id', 'ownAssets'],
                where: {
                    ownAssets: { [Op.ne]: null }, 
                },
            });
            return ownAssets;
        } catch (error) {
            throw new Error(`Error fetching own assets: ${error.message}`);
        }
    }
    static async updateOwnAssets(id, { ownAssets }) {
        try {
            if (!ownAssets) {
                throw new Error("The 'ownAssets' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ ownAssets }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Own assets with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating own assets with ID ${id}: ${error.message}`);
        }
    }
    static async deleteOwnAssets(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Own assets with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting own assets with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createReceivesBonus({ receivesBonus }) {
        try {
            if (!receivesBonus) {
                throw new Error("The 'receivesBonus' field is required.");
            }

            const newRecord = await Parameters.create({
                receivesBonus,
                province: null,
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
            throw new Error(`Error creating receives bonus: ${error.message}`);
        }
    }
    static async getAllReceivesBonuses() {
        try {
            const receivesBonuses = await Parameters.findAll({
                attributes: ['id', 'receivesBonus'],
                where: {
                    receivesBonus: { [Op.ne]: null }, 
                },
            });
            return receivesBonuses;
        } catch (error) {
            throw new Error(`Error fetching receives bonuses: ${error.message}`);
        }
    }
    static async updateReceivesBonus(id, { receivesBonus }) {
        try {
            if (!receivesBonus) {
                throw new Error("The 'receivesBonus' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ receivesBonus }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Receives bonus with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating receives bonus with ID ${id}: ${error.message}`);
        }
    }
    static async deleteReceivesBonus(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Receives bonus with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting receives bonus with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createPensioner({ pensioner }) {
        try {
            if (!pensioner) {
                throw new Error("The 'pensioner' field is required.");
            }

            const newRecord = await Parameters.create({
                pensioner,
                province: null,
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
            throw new Error(`Error creating pensioner: ${error.message}`);
        }
    }
    static async getAllPensioners() {
        try {
            const pensioners = await Parameters.findAll({
                attributes: ['id', 'pensioner'],
                where: {
                    pensioner: { [Op.ne]: null }, 
                },
            });
            return pensioners;
        } catch (error) {
            throw new Error(`Error fetching pensioners: ${error.message}`);
        }
    }
    static async updatePensioner(id, { pensioner }) {
        try {
            if (!pensioner) {
                throw new Error("The 'pensioner' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ pensioner }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Pensioner with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating pensioner with ID ${id}: ${error.message}`);
        }
    }
    static async deletePensioner(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Pensioner with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting pensioner with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createHealthInsurance({ healthInsurance }) {
        try {
            if (!healthInsurance) {
                throw new Error("The 'healthInsurance' field is required.");
            }

            const newRecord = await Parameters.create({
                healthInsurance,
                province: null,
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
            throw new Error(`Error creating health insurance: ${error.message}`);
        }
    }
    static async getAllHealthInsurances() {
        try {
            const healthInsurances = await Parameters.findAll({
                attributes: ['id', 'healthInsurance'],
                where: {
                    healthInsurance: { [Op.ne]: null },
                },
            });
            return healthInsurances;
        } catch (error) {
            throw new Error(`Error fetching health insurances: ${error.message}`);
        }
    }
    static async updateHealthInsurance(id, { healthInsurance }) {
        try {
            if (!healthInsurance) {
                throw new Error("The 'healthInsurance' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ healthInsurance }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Health insurance with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating health insurance with ID ${id}: ${error.message}`);
        }
    }
    static async deleteHealthInsurance(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Health insurance with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting health insurance with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createSupportDocuments({ supportDocuments }) {
        try {
            if (!supportDocuments) {
                throw new Error("The 'supportDocuments' field is required.");
            }

            const newRecord = await Parameters.create({
                supportDocuments,
                province: null,
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
            throw new Error(`Error creating support documents: ${error.message}`);
        }
    }
    static async getAllSupportDocuments() {
        try {
            const supportDocuments = await Parameters.findAll({
                attributes: ['id', 'supportDocuments'],
                where: {
                    supportDocuments: { [Op.ne]: null },
                },
            });
            return supportDocuments;
        } catch (error) {
            throw new Error(`Error fetching support documents: ${error.message}`);
        }
    }
    static async updateSupportDocuments(id, { supportDocuments }) {
        try {
            if (!supportDocuments) {
                throw new Error("The 'supportDocuments' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ supportDocuments }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Support documents with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating support documents with ID ${id}: ${error.message}`);
        }
    }
    static async deleteSupportDocuments(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Support documents with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting support documents with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createVulnerabilitySituation({ vulnerabilitySituation }) {
        try {
            if (!vulnerabilitySituation) {
                throw new Error("The 'vulnerabilitySituation' field is required.");
            }

            const newRecord = await Parameters.create({
                vulnerabilitySituation,
                province: null,
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
            throw new Error(`Error creating vulnerability situation: ${error.message}`);
        }
    }
    static async getAllVulnerabilitySituations() {
        try {
            const vulnerabilitySituations = await Parameters.findAll({
                attributes: ['id', 'vulnerabilitySituation'],
                where: {
                    vulnerabilitySituation: { [Op.ne]: null },
                },
            });
            return vulnerabilitySituations;
        } catch (error) {
            throw new Error(`Error fetching vulnerability situations: ${error.message}`);
        }
    }
    static async updateVulnerabilitySituation(id, { vulnerabilitySituation }) {
        try {
            if (!vulnerabilitySituation) {
                throw new Error("The 'vulnerabilitySituation' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ vulnerabilitySituation }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Vulnerability situation with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating vulnerability situation with ID ${id}: ${error.message}`);
        }
    }
    static async deleteVulnerabilitySituation(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Vulnerability situation with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting vulnerability situation with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createCatastrophicIllness({ catastrophicIllness }) {
        try {
            if (!catastrophicIllness) {
                throw new Error("The 'catastrophicIllness' field is required.");
            }

            const newRecord = await Parameters.create({
                catastrophicIllness,
                province: null,
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
            throw new Error(`Error creating catastrophic illness: ${error.message}`);
        }
    }
    static async getAllCatastrophicIllnesses() {
        try {
            const catastrophicIllnesses = await Parameters.findAll({
                attributes: ['id', 'catastrophicIllness'],
                where: {
                    catastrophicIllness: { [Op.ne]: null },
                },
            });
            return catastrophicIllnesses;
        } catch (error) {
            throw new Error(`Error fetching catastrophic illnesses: ${error.message}`);
        }
    }
    static async updateCatastrophicIllness(id, { catastrophicIllness }) {
        try {
            if (!catastrophicIllness) {
                throw new Error("The 'catastrophicIllness' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ catastrophicIllness }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Catastrophic illness with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating catastrophic illness with ID ${id}: ${error.message}`);
        }
    }
    static async deleteCatastrophicIllness(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Catastrophic illness with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting catastrophic illness with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createDisability({ disability }) {
        try {
            if (!disability) {
                throw new Error("The 'disability' field is required.");
            }

            const newRecord = await Parameters.create({
                disability,
                province: null,
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
            throw new Error(`Error creating disability: ${error.message}`);
        }
    }
    static async getAllDisabilities() {
        try {
            const disabilities = await Parameters.findAll({
                attributes: ['id', 'disability'],
                where: {
                    disability: { [Op.ne]: null },
                },
            });
            return disabilities;
        } catch (error) {
            throw new Error(`Error fetching disabilities: ${error.message}`);
        }
    }
    static async updateDisability(id, { disability }) {
        try {
            if (!disability) {
                throw new Error("The 'disability' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ disability }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Disability with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating disability with ID ${id}: ${error.message}`);
        }
    }
    static async deleteDisability(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Disability with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting disability with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createProtocol({ protocol }) {
        try {
            if (!protocol) {
                throw new Error("The 'protocol' field is required.");
            }

            const newRecord = await Parameters.create({
                protocol,
                province: null,
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
                attachments: null,
                attentionType: null,
                caseStatus: null,
                area: null,
                topic: null,
            });

            return newRecord;
        } catch (error) {
            throw new Error(`Error creating protocol: ${error.message}`);
        }
    }
    static async getAllProtocols() {
        try {
            const protocols = await Parameters.findAll({
                attributes: ['id', 'protocol'],
                where: {
                    protocol: { [Op.ne]: null },
                },
            });
            return protocols;
        } catch (error) {
            throw new Error(`Error fetching protocols: ${error.message}`);
        }
    }
    static async updateProtocol(id, { protocol }) {
        try {
            if (!protocol) {
                throw new Error("The 'protocol' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ protocol }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Protocol with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating protocol with ID ${id}: ${error.message}`);
        }
    }
    static async deleteProtocol(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Protocol with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting protocol with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createAttachments({ attachments }) {
        try {
            if (!attachments) {
                throw new Error("The 'attachments' field is required.");
            }

            const newRecord = await Parameters.create({
                attachments,
                province: null,
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
                attentionType: null,
                caseStatus: null,
                area: null,
                topic: null,
            });

            return newRecord;
        } catch (error) {
            throw new Error(`Error creating attachments: ${error.message}`);
        }
    }
    static async getAllAttachments() {
        try {
            const attachments = await Parameters.findAll({
                attributes: ['id', 'attachments'],
                where: {
                    attachments: { [Op.ne]: null },
                },
            });
            return attachments;
        } catch (error) {
            throw new Error(`Error fetching attachments: ${error.message}`);
        }
    }
    static async updateAttachments(id, { attachments }) {
        try {
            if (!attachments) {
                throw new Error("The 'attachments' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ attachments }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Attachments with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating attachments with ID ${id}: ${error.message}`);
        }
    }
    static async deleteAttachments(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Attachments with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting attachments with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createAttentionType({ attentionType }) {
        try {
            if (!attentionType) {
                throw new Error("The 'attentionType' field is required.");
            }

            const newRecord = await Parameters.create({
                attentionType,
                province: null,
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
                caseStatus: null,
                area: null,
                topic: null,
            });

            return newRecord;
        } catch (error) {
            throw new Error(`Error creating attentionType: ${error.message}`);
        }
    }
    static async getAllAttentionTypes() {
        try {
            const attentionTypes = await Parameters.findAll({
                attributes: ['id', 'attentionType'],
                where: {
                    attentionType: { [Op.ne]: null },
                },
            });
            return attentionTypes;
        } catch (error) {
            throw new Error(`Error fetching attentionTypes: ${error.message}`);
        }
    }
    static async updateAttentionType(id, { attentionType }) {
        try {
            if (!attentionType) {
                throw new Error("The 'attentionType' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ attentionType }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `AttentionType with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating attentionType with ID ${id}: ${error.message}`);
        }
    }
    static async deleteAttentionType(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `AttentionType with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting attentionType with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createCaseStatus({ caseStatus }) {
        try {
            if (!caseStatus) {
                throw new Error("The 'caseStatus' field is required.");
            }

            const newRecord = await Parameters.create({
                caseStatus,
                province: null,
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
                area: null,
                topic: null,
            });

            return newRecord;
        } catch (error) {
            throw new Error(`Error creating caseStatus: ${error.message}`);
        }
    }
    static async getAllCaseStatuses() {
        try {
            const caseStatuses = await Parameters.findAll({
                attributes: ['id', 'caseStatus'],
                where: {
                    caseStatus: { [Op.ne]: null },
                },
            });
            return caseStatuses;
        } catch (error) {
            throw new Error(`Error fetching caseStatuses: ${error.message}`);
        }
    }
    static async updateCaseStatus(id, { caseStatus }) {
        try {
            if (!caseStatus) {
                throw new Error("The 'caseStatus' field is required.");
            }
            const [rowsUpdated] = await Parameters.update({ caseStatus }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `CaseStatus with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating caseStatus with ID ${id}: ${error.message}`);
        }
    }
    static async deleteCaseStatus(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `CaseStatus with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting caseStatus with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
    static async createAreaTopic({ area, topic }, internalId) {
        try {
            // Validar que se envíen tanto area como topic
            if (!area || !topic) {
                throw new Error("Both 'area' and 'topic' are required.");
            }

            // Crear el objeto con area, topic y valores nulos para los demás campos
            const data = {
                area,
                topic,
                province: null,
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
            };

            // Insertar el registro
            const newParameter = await Parameters.create(data);

            // 🔹 Registrar en Audit que un usuario interno creó un parámetro
            await AuditModel.registerAudit(
                internalId, 
                "INSERT",
                "Parameters",
                `El usuario interno ${internalId} creó un nuevo parámetro con ID ${newParameter.id}`
            );

            return newParameter;
        } catch (error) {
            throw new Error(`Error creating parameter: ${error.message}`);
        }
    }
    static async getAllAreaTopics() {
        try {
            const areaTopics = await Parameters.findAll({
                attributes: ['id', 'area', 'topic'],
                where: {
                    area: { [Op.ne]: null },
                    topic: { [Op.ne]: null },
                },
            });
            return areaTopics;
        } catch (error) {
            throw new Error(`Error fetching areaTopics: ${error.message}`);
        }
    }
    static async updateAreaTopic(id, { area, topic }) {
        try {
            if (!area || !topic) {
                throw new Error("Both 'area' and 'topic' are required.");
            }
            const [rowsUpdated] = await Parameters.update({ area, topic }, {
                where: { id },
            });
            if (rowsUpdated === 0) return null;
            return { message: `Area and Topic with ID ${id} updated successfully.` };
        } catch (error) {
            throw new Error(`Error updating area and topic with ID ${id}: ${error.message}`);
        }
    }
    static async deleteAreaTopic(id) {
        try {
            const rowsDeleted = await Parameters.destroy({
                where: { id },
            });
            if (rowsDeleted === 0) return null;
            return { message: `Area and Topic with ID ${id} deleted successfully.` };
        } catch (error) {
            throw new Error(`Error deleting area and topic with ID ${id}: ${error.message}`);
        }
    }
/************************************************************************************************************************************* */
}
