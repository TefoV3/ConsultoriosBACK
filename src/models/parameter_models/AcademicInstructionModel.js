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

    static async create(data) {
        try {
            return await Academic_Instruction.create(data);
        } catch (error) {
            throw new Error(`Error creating academic instruction: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const academic_InstructionRecord = await this.getById(id);
            if (!academic_InstructionRecord) return null;

            const [rowsUpdated] = await Academic_Instruction.update(data, {
                where: { Academic_Instruction_ID: id, Academic_Instruction_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating academic instruction: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const academic_InstructionRecord = await this.getById(id);
            if (!academic_InstructionRecord) return null;

            await Academic_Instruction.update(
                { Academic_Instruction_Status: false },
                { where: { AcademicInstruction_ID: id, Academic_Instruction_Status: true } }
            );
            return academic_InstructionRecord;
        } catch (error) {
            throw new Error(`Error deleting academic instruction: ${error.message}`);
        }
    }
}
