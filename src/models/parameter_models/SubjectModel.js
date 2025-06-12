import { Subject } from "../../schemas/parameter_tables/Subject.js";
import { AuditModel } from "../../models/AuditModel.js";

export class SubjectModel {

    static async getAll() {
        try {
            return await Subject.findAll({ where: { Subject_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving subjects: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Subject.findOne({
                where: { Subject_ID: id, Subject_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving subject: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Subject.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Subject",
                            `El usuario interno ${internalId} creó un nuevo registro de Subject con ID ${newRecord.Subject_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating subject: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Subject.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Subject",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Subject.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Subject: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const subjectRecord = await this.getById(id);
            if (!subjectRecord) return null;

            const [rowsUpdated] = await Subject.update(data, {
                where: { Subject_ID: id, Subject_Status: true }
            });

            if (rowsUpdated === 0) return null;
            
                        await AuditModel.registerAudit(
                            internalId,
                            "UPDATE",
                            "Subject",
                            `El usuario interno ${internalId} actualizó la Subject con ID ${id}`
                        );
            
                        return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating subject: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const subjectRecord = await this.getById(id);
            if (!subjectRecord) return null;

            await Subject.update(
                { Subject_Status: false },
                { where: { Subject_ID: id, Subject_Status: true } }
            );

            await AuditModel.registerAudit(
                            internalId,
                            "DELETE",
                            "Subject",
                            `El usuario interno ${internalId} eliminó lógicamente la Subject con ID ${id}`
                        );
            return subjectRecord;
        } catch (error) {
            throw new Error(`Error deleting subject: ${error.message}`);
        }
    }
}
