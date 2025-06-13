import { Health_Insurance } from "../../schemas/parameter_tables/Health_Insurance.js";
import { AuditModel } from "../../models/AuditModel.js";

export class HealthInsuranceModel {
    
    static async getAll() {
        try {
            return await Health_Insurance.findAll({ where: { Health_Insurance_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Health_Insurance.findOne({
                where: { Health_Insurance_ID: id, Health_Insurance_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del seguro de salud no exista
            const existingHealthInsurance = await Health_Insurance.findOne({
                where: { Health_Insurance_Name: data.Health_Insurance_Name, Health_Insurance_Status: true }
            });
            if (existingHealthInsurance) {
                throw new Error(`Health Insurance with name "${data.Health_Insurance_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Health_Insurance_Status = true; // Aseguramos que el seguro de salud esté activo al crearlo
            data.Health_Insurance_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Health_Insurance.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Health_Insurance",
                            `El usuario interno ${internalId} creó un nuevo registro de Health_Insurance con ID ${newRecord.Health_Insurance_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
             const createdRecords = await Health_Insurance.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Health_Insurance",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Health_Insurance.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Health Insurance: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const caseStatusRecord = await this.getById(id);
            if (!caseStatusRecord) return null;

            const [rowsUpdated] = await Health_Insurance.update(data, {
                where: { Health_Insurance_ID: id, Health_Insurance_Status: true }
            });

            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Health_Insurance",
                `El usuario interno ${internalId} actualizó Health_Insurance con ID ${id}`
            );
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const caseStatusRecord = await this.getById(id);
            if (!caseStatusRecord) return null;

            await Health_Insurance.update(
                { Health_Insurance_Status: false },
                { where: { Health_Insurance_ID: id, Health_Insurance_Status: true } }
            );

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Health_Insurance",
                `El usuario interno ${internalId} eliminó lógicamente Health_Insurance con ID ${id}`
            );

            return caseStatusRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
