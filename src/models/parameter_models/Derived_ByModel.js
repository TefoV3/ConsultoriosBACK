import { Derived_By } from "../../schemas/parameter_tables/Derived_By.js";
import { AuditModel } from "../../models/AuditModel.js";

export class DerivedByModel {

    static async getAll() {
        try {
            return await Derived_By.findAll({
                where: { Derived_By_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving derived by records: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Derived_By.findOne({
                where: { Derived_By_ID: id, Derived_By_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving derived by record: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del derivado no exista
            const existingDerivedBy = await Derived_By.findOne({
                where: { Derived_By_Name: data.Derived_By_Name, Derived_By_Status: true }
            });
            if (existingDerivedBy) {
                throw new Error(`Derived By with name "${data.Derived_By_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Derived_By_Status = true; // Aseguramos que el derivado esté activo al crearlo
            data.Derived_By_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Derived_By.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Derived_By",
                            `El usuario interno ${internalId} creó un nuevo registro Derived_By con ID ${newRecord.Derived_By_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating derived by record: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Derived_By.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Derived_By",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Derived_By.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Derived By: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const derivedByRecord = await this.getById(id);
            if (!derivedByRecord) return null;

            const [rowsUpdated] = await Derived_By.update(data, {
                where: { Derived_By_ID: id, Derived_By_Status: true }
            });

            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Derived_By",
                `El usuario interno ${internalId} actualizó la Derived_By con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating derived by record: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const derivedByRecord = await this.getById(id);
            if (!derivedByRecord) return null;

            await Derived_By.update(
                { Derived_By_Status: false },
                { where: { Derived_By_ID: id, Derived_By_Status: true } }
            );

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Derived_By",
                `El usuario interno ${internalId} eliminó lógicamente Derived_By con ID ${id}`
            );

            return derivedByRecord;
        } catch (error) {
            throw new Error(`Error deleting derived by record: ${error.message}`);
        }
    }
}
