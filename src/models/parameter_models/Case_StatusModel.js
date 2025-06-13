import { Case_Status } from "../../schemas/parameter_tables/Case_Status.js";
import { AuditModel } from "../../models/AuditModel.js";

export class CaseStatusModel {
    
    static async getAll() {
        try {
            return await Case_Status.findAll({ where: { Case_Status_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Case_Status.findOne({
                where: { Case_Status_ID: id, Case_Status_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del estado del caso no exista
            const existingCaseStatus = await Case_Status.findOne({
                where: { Case_Status_Name: data.Case_Status_Name, Case_Status_Status: true }
            });
            if (existingCaseStatus) {
                throw new Error(`Case Status with name "${data.Case_Status_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Case_Status_Status = true; // Aseguramos que el estado del caso esté activo al crearlo
            data.Case_Status_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental



            const newRecord = await Case_Status.create(data);
            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "Case_Status",
                `El usuario interno ${internalId} creó un nuevo registro de CaseStatus con ID ${newRecord.Case_Status_ID}`
            );

            return newRecord

        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Case_Status.bulkCreate(data);
            
            await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Case_Status",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de CaseStatus.`
                        );
            
            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Case Status: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const caseStatusRecord = await this.getById(id);
            if (!caseStatusRecord) return null;

            const [rowsUpdated] = await Case_Status.update(data, {
                where: { Case_Status_ID: id, Case_Status_Status: true }
            });
            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Case_Status",
                `El usuario interno ${internalId} actualizó la CaseStatus con ID ${id}`
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

            await Case_Status.update(
                { Case_Status_Status: false },
                { where: { Case_Status_ID: id, Case_Status_Status: true } }
            );

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Case_Status",
                `El usuario interno ${internalId} eliminó lógicamente la CaseStatus con ID ${id}`
            );
            
            return caseStatusRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
