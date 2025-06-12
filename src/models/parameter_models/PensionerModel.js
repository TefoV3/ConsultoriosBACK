import { Pensioner } from "../../schemas/parameter_tables/Pensioner.js";
import { AuditModel } from "../../models/AuditModel.js";

export class PensionerModel {

    static async getAll() {
        try {
            return await Pensioner.findAll({ where: { Pensioner_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving disabilities: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Pensioner.findOne({
                where: { Pensioner_ID: id, Pensioner_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving Pensioner: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newRecord = await Pensioner.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Pensioner",
                            `El usuario interno ${internalId} creó un nuevo registro de Pensioner con ID ${newRecord.Pensioner_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating Pensioner: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Pensioner.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Pensioner",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Pensioner`
                        );
            
                        return createdRecords;

        } catch (error) {
            throw new Error(`Error creating Pensioner: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const PensionerRecord = await this.getById(id);
            if (!PensionerRecord) return null;

            const [rowsUpdated] = await Pensioner.update(data, {
                where: { Pensioner_ID: id, Pensioner_Status: true }
            });

            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Pensioner",
                `El usuario interno ${internalId} actualizó Pensioner con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating Pensioner: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const PensionerRecord = await this.getById(id);
            if (!PensionerRecord) return null;

            await Pensioner.update(
                { Pensioner_Status: false },
                { where: { Pensioner_ID: id, Pensioner_Status: true } }
            );

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Pensioner",
                `El usuario interno ${internalId} eliminó lógicamente Pensioner con ID ${id}`
            );
            return PensionerRecord;
        } catch (error) {
            throw new Error(`Error deleting Pensioner: ${error.message}`);
        }
    }

}