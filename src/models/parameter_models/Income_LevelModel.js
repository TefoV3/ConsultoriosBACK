import { Income_Level } from "../../schemas/parameter_tables/Income_Level.js";
import { AuditModel } from "../../models/AuditModel.js";

export class IncomeLevelModel {
    
    static async getAll() {
        try {
            return await Income_Level.findAll({ where: { Income_Level_Status: true } });
        } catch (error) {
            throw new Error(`Error retrieving case Statuss: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Income_Level.findOne({
                where: { Income_Level_ID: id, Income_Level_Status: true }
            });
        }
        catch (error) {
            throw new Error(`Error retrieving case Status: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            // Validar que el nombre del nivel de ingreso no exista
            const existingIncomeLevel = await Income_Level.findOne({
                where: { Income_Level_Name: data.Income_Level_Name, Income_Level_Status: true }
            });
            if (existingIncomeLevel) {
                throw new Error(`Income Level with name "${data.Income_Level_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Income_Level_Status = true; // Aseguramos que el nivel de ingreso esté activo al crearlo
            data.Income_Level_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental
            const newRecord = await Income_Level.create(data);
           
                       await AuditModel.registerAudit(
                           internalId,
                           "INSERT",
                           "Income_Level",
                           `El usuario interno ${internalId} creó un nuevo registro de Income_Level con ID ${newRecord.Academic_Instruction_ID}`
                       );
           
                       return newRecord;
        } catch (error) {
            throw new Error(`Error creating case Status: ${error.message}`);
        }
    }
    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Academic_Instruction.bulkCreate(data);
            
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "Income_Level",
                            `El usuario interno ${internalId} creó ${createdRecords.length} registros de Income_Level.`
                        );
            
                        return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Income_Level: ${error.message}`);
        }
    }
    static async update(id, data, internalId) {
        try {
            const Income_LevelRecord = await this.getById(id);
            if (!Income_LevelRecord) return null;

            const [rowsUpdated] = await Income_Level.update(data, {
                where: { Income_Level_ID: id, Income_Level_Status: true }
            });

            if (rowsUpdated === 0) return null;
            
                        await AuditModel.registerAudit(
                            internalId,
                            "UPDATE",
                            "Income_Level",
                            `El usuario interno ${internalId} actualizó la Income_Level con ID ${id}`
                        );
            
                        return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating case Status: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const Income_LevelRecord = await this.getById(id);
            if (!Income_LevelRecord) return null;

            await Income_Level.update(
                { Income_Level_Status: false },
                { where: { Income_Level_ID: id, Income_Level_Status: true } }
            );

            await AuditModel.registerAudit(
                            internalId,
                            "DELETE",
                            "Income_Level",
                            `El usuario interno ${internalId} eliminó lógicamente Income_Level con ID ${id}`
                        );
            return Income_LevelRecord;
        } catch (error) {
            throw new Error(`Error deleting case Status: ${error.message}`);
        }
    }
}
