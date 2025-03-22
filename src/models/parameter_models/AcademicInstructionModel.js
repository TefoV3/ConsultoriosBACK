import { AcademicInstruction } from "../../schemas/parameter_tables/AcademicInstruction.js";

export class AcademicInstructionModel {

    static async getAll() {
        try {
            return await AcademicInstruction.findAll({
                where: { AcademicInstruction_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving academic instructions: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await AcademicInstruction.findOne({
                where: { AcademicInstruction_ID: id, AcademicInstruction_Status: true }
            });
        } catch (error) {
            throw new Error(`Error retrieving academic instruction: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await AcademicInstruction.create(data);
        } catch (error) {
            throw new Error(`Error creating academic instruction: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const academicInstructionRecord = await this.getById(id);
            if (!academicInstructionRecord) return null;

            const [rowsUpdated] = await AcademicInstruction.update(data, {
                where: { AcademicInstruction_ID: id, AcademicInstruction_Status: true }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating academic instruction: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const academicInstructionRecord = await this.getById(id);
            if (!academicInstructionRecord) return null;

            await AcademicInstruction.update(
                { AcademicInstruction_Status: false },
                { where: { AcademicInstruction_ID: id, AcademicInstruction_Status: true } }
            );
            return academicInstructionRecord;
        } catch (error) {
            throw new Error(`Error deleting academic instruction: ${error.message}`);
        }
    }
}
