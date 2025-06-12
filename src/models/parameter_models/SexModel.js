import { Sex } from "../../schemas/parameter_tables/Sex.js";
import { AuditModel } from "../../models/AuditModel.js";

export class SexModel {

    static async getAll() {
        try {
            return await Sex.findAll({
                where: { Sex_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving sexes: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Sex.findOne({
                where: { Sex_ID: id, Sex_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving sex: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Sex.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Sex",
                            `El usuario interno ${internalId} creó un nuevo registro de Sex con ID ${newRecord.Sex_ID}`
                        );
            
            return newRecord;

        } catch (error) {
            throw new Error(`Error creating sex: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Sex.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Sex",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Sex.`
                        );
            
                        return createdRecords;

        } catch (error) {
            throw new Error(`Error creating Sex: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const sexRecord = await this.getById(id);
            if (!sexRecord) return null;

            const [rowsUpdated] = await Sex.update(data, {
                where: { Sex_ID: id, Sex_Status: true }
            });

            if (rowsUpdated === 0) return null;
            
                        await AuditModel.registerAudit(
                            internalId,
                            "UPDATE",
                            "Sex",
                            `El usuario interno ${internalId} actualizó Sex con ID ${id}`
                        );
            
                        return await this.getById(id);

        } catch (error) {
            throw new Error(`Error updating sex: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const sexRecord = await this.getById(id);
            if (!sexRecord) return null;

            await Sex.update(
                { Sex_Status: false },
                { where: { Sex_ID: id, Sex_Status: true } }
            );

            await AuditModel.registerAudit(
                            internalId,
                            "DELETE",
                            "Sex",
                            `El usuario interno ${internalId} eliminó lógicamente Sex con ID ${id}`
                        );
            return sexRecord;
        } catch (error) {
            throw new Error(`Error deleting sex: ${error.message}`);
        }
    }
}
