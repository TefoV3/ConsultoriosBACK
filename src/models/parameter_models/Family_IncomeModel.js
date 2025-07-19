import { Family_Income } from "../../schemas/parameter_tables/Family_Income.js";
import { AuditModel } from "../../models/AuditModel.js";

export class FamilyIncomeModel {
    
    static async getAll() {
        try {
            return await Family_Income.findAll({ where: { Family_Income_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Family_Income.findOne({
                where: { Family_Income_ID: id, Family_Income_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del ingreso familiar no exista
            const existingFamilyIncome = await Family_Income.findOne({
                where: { Family_Income_Name: data.Family_Income_Name, Family_Income_Status: true }
            });
            if (existingFamilyIncome) {
                throw new Error(`Family Income with name "${data.Family_Income_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Family_Income_Status = true; // Aseguramos que el ingreso familiar esté activo al crearlo
            data.Family_Income_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Family_Income.create(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Family_Income",
                            `El usuario interno ${internalId} creó un nuevo registro de Family_Income con ID ${newRecord.Family_Income_ID}`
                        );
            
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Family_Income.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Family_Income",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Family_Income.`
                        );
            
                        return createdRecords; // Usa el bulkCreate de Sequelize
        } catch (error) {
            throw new Error(`Error creating Family Income: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const Family_IncomeRecord = await this.getById(id);
            if (!Family_IncomeRecord) return null;

            const [rowsUpdated] = await Family_Income.update(data, {
                where: { Family_Income_ID: id, Family_Income_Status: true }
            });

            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Family_Income",
                `El usuario interno ${internalId} actualizó Family_Income con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const Family_IncomeRecord = await this.getById(id);
            if (!Family_IncomeRecord) return null;

            await Family_Income.update(
                { Family_Income_Status: false },
                { where: { Family_Income_ID: id, Family_Income_Status: true } }
            );
            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Family_Income",
                `El usuario interno ${internalId} eliminó lógicamente Family_Income con ID ${id}`
            );
            return Family_IncomeRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
