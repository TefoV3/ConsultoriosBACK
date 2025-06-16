import { Disability } from "../../schemas/parameter_tables/Disability.js";
import { AuditModel } from "../../models/AuditModel.js";

export class DisabilityModel {

    static async getAll() {
        try {
            return await Disability.findAll({ where: { Disability_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving disabilities: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Disability.findOne({
                where: { Disability_ID: id, Disability_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving disability: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre de la discapacidad no exista
            const existingDisability = await Disability.findOne({
                where: { Disability_Name: data.Disability_Name, Disability_Status: true }
            });
            if (existingDisability) {
                throw new Error(`Disability with name "${data.Disability_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Disability_Status = true; // Aseguramos que la discapacidad esté activa al crearlo
            data.Disability_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Disability.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Disability",
                            `El usuario interno ${internalId} creó un nuevo registro de Discapacidad con ID ${newRecord.Disability_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating disability: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Disability.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Disability",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Disability.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Disability: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const disabilityRecord = await this.getById(id);
            if (!disabilityRecord) return null;

            const [rowsUpdated] = await Disability.update(data, {
                where: { Disability_ID: id, Disability_Status: true }
            });

            if (rowsUpdated === 0) return null;
            
                        await AuditModel.registerAudit(
                            internalId,
                            "UPDATE",
                            "Disability",
                            `El usuario interno ${internalId} actualizó Disability con ID ${id}`
                        );
            
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating disability: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const disabilityRecord = await this.getById(id);
            if (!disabilityRecord) return null;

            await Disability.update(
                { Disability_Status: false },
                { where: { Disability_ID: id, Disability_Status: true } }
            );

            await AuditModel.registerAudit(
                            internalId,
                            "DELETE",
                            "Disability",
                            `El usuario interno ${internalId} eliminó lógicamente Disability con ID ${id}`
                        );
            return disabilityRecord;
        } catch (error) {
            throw new Error(`Error deleting disability: ${error.message}`);
        }
    }

}