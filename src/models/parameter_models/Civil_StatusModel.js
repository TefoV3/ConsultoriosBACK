import { Civil_Status } from "../../schemas/parameter_tables/Civil_Status.js";
import { AuditModel } from "../../models/AuditModel.js";

export class CivilStatusModel {

    static async getAll() {
        try {
            return await Civil_Status.findAll({
                where: { Civil_Status_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving civil statuses: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Civil_Status.findOne({
                where: { Civil_Status_ID: id, Civil_Status_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving civil status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del estado civil no exista
            const existingCivilStatus = await Civil_Status.findOne({
                where: { Civil_Status_Name: data.Civil_Status_Name, Civil_Status_Status: true }
            });
            if (existingCivilStatus) {
                throw new Error(`Civil Status with name "${data.Civil_Status_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Civil_Status_Status = true; // Aseguramos que el estado civil esté activo al crearlo
            data.Civil_Status_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Civil_Status.create(data);
                                await AuditModel.registerAudit(
                                    internalId,
                                    "INSERT",
                                    "Civil_Statusn",
                                    `El usuario interno ${internalId} creó un nuevo registro de Civil Status con ID ${newRecord.Civil_Status_ID}`
                                );
                                    return newRecord
        } catch (error) {
            throw new Error(`Error creating civil status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Civil_Status.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Civil_Status",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Civil Status.`
                        );
            
                        return createdRecords; // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Civil Status: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const civilStatusRecord = await this.getById(id);
            if (!civilStatusRecord) return null;

            const [rowsUpdated] = await Civil_Status.update(data, {
                where: { Civil_Status_ID: id, Civil_Status_Status: true }
            });

            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Civil_Status",
                `El usuario interno ${internalId} actualizó la Civil Status con ID ${id}`
            );
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating civil status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const civilStatusRecord = await this.getById(id);
            if (!civilStatusRecord) return null;

            await Civil_Status.update(
                { Civil_Status_Status: false },
                { where: { Civil_Status_ID: id, Civil_Status_Status: true } }
            );

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Civil_Status",
                `El usuario interno ${internalId} eliminó lógicamente la Civil Status con ID ${id}`
            );

            return civilStatusRecord;
        } catch (error) {
            throw new Error(`Error deleting civil status: ${error.message}`);
        }
    }
}
