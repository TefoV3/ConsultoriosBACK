import { Practical_Hours } from "../../schemas/parameter_tables/Practical_Hours.js";
import { AuditModel } from "../../models/AuditModel.js";

export class PracticalHoursModel {

    static async getAll() {
        try {
            return await Practical_Hours.findAll({
                where: { Practical_Hours_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving practical hours: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Practical_Hours.findOne({
                where: { Practical_Hours_ID: id, Practical_Hours_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving practical hours: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Practical_Hours.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Practical_Hours",
                            `El usuario interno ${internalId} creó un nuevo registro de Practical_Hours con ID ${newRecord.Practical_Hours_ID}`
                        );
            
                        return newRecord;

        } catch (error) {
            throw new Error(`Error creating practical hours: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Practical_Hours.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Practical_Hours",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Practical_Hours.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Practical Hours: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const hoursRecord = await this.getById(id);
            if (!hoursRecord) return null;

            const [rowsUpdated] = await Practical_Hours.update(data, {
                where: { Practical_Hours_ID: id, Practical_Hours_Status: true }
            });

            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Practical_Hours",
                `El usuario interno ${internalId} actualizó la Practical_Hours con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating practical hours: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const hoursRecord = await this.getById(id);
            if (!hoursRecord) return null;

            await Practical_Hours.update(
                { Practical_Hours_Status: false },
                { where: { Practical_Hours_ID: id, Practical_Hours_Status: true } }
            );

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Practical_Hours",
                `El usuario interno ${internalId} eliminó lógicamente Practical_Hours con ID ${id}`
            );
            return hoursRecord;
        } catch (error) {
            throw new Error(`Error deleting practical hours: ${error.message}`);
        }
    }
}
