import { Parameters } from "../schemas/Parameters.js";
import { AuditModel } from "../models/AuditModel.js";

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
    static async create({ zone, sector }, internalId) {
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
    static async update(id, { zone, sector }, internalId) {
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
    static async delete(id, internalId) {
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

}
