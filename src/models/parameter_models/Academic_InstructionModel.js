// Importa el modelo de auditoría
import { AuditModel } from "../../models/AuditModel.js";
import { Academic_Instruction } from "../../schemas/parameter_tables/Academic_Instruction.js";

export class AcademicInstructionModel {

    static async getAll() {
        try {
            return await Academic_Instruction.findAll({
                where: { Academic_Instruction_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving academic instructions: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Academic_Instruction.findOne({
                where: { Academic_Instruction_ID: id, Academic_Instruction_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving academic instruction: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            //Validar que el nombre de la instrucción académica no exista
            const existingInstruction = await Academic_Instruction.findOne({ 
                where: { Academic_Instruction_Name: data.Academic_Instruction_Name, Academic_Instruction_Status: true }
            });
            if (existingInstruction) {
                throw new Error(`Academic instruction with name "${data.Academic_Instruction_Name}" already exists.`);
            }
            // Aseguramos que el estado esté activo al crear
            data.Academic_Instruction_Status = true; // Aseguramos que la instrucción académica esté activa al crearlo
            data.Academic_Instruction_ID = undefined; // Aseguramos que el ID no se envíe, ya que es autoincremental


            const newRecord = await Academic_Instruction.create(data);

            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "Academic_Instruction",
                `El usuario interno ${internalId} creó un nuevo registro de instrucción académica con ID ${newRecord.Academic_Instruction_ID}`
            );

            return newRecord;
        } catch (error) {
            throw new Error(`Error creating academic instruction: ${error.message}`);
        }
    }

    static async bulkCreate(data, internalId) {
        try {
            const createdRecords = await Academic_Instruction.bulkCreate(data);

            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "Academic_Instruction",
                `El usuario interno ${internalId} creó ${createdRecords.length} registros de instrucción académica.`
            );

            return createdRecords;
        } catch (error) {
            throw new Error(`Error creating Academic Instruction: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const academic_InstructionRecord = await this.getById(id);
            if (!academic_InstructionRecord) return null;            

            const [rowsUpdated] = await Academic_Instruction.update(data, {
                where: { Academic_Instruction_ID: id, Academic_Instruction_Status: true }
            });

            if (rowsUpdated === 0) return null;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Academic_Instruction",
                `El usuario interno ${internalId} actualizó la instrucción académica con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating academic instruction: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const academic_InstructionRecord = await this.getById(id);
            if (!academic_InstructionRecord) return null;

            await Academic_Instruction.update(
                { Academic_Instruction_Status: false },
                { where: { Academic_Instruction_ID: id, Academic_Instruction_Status: true } }
            );

            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Academic_Instruction",
                `El usuario interno ${internalId} eliminó lógicamente la instrucción académica con ID ${id}`
            );

            return academic_InstructionRecord;
        } catch (error) {
            throw new Error(`Error deleting academic instruction: ${error.message}`);
        }
    }
}
