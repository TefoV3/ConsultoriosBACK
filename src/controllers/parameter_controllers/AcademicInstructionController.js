import { AcademicInstructionModel } from "../../models/parameter_tables/AcademicInstructionModel.js";

export class AcademicInstructionController {

    static async getAll(req, res) {
        try {
            const data = await AcademicInstructionModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await AcademicInstructionModel.getById(id);
            if (!data) return res.status(404).json({ message: "Academic instruction not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const newAcademicInstruction = await AcademicInstructionModel.create(req.body);
            res.status(201).json(newAcademicInstruction);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedAcademicInstruction = await AcademicInstructionModel.update(id, req.body);
            if (!updatedAcademicInstruction) return res.status(404).json({ message: "Academic instruction not found or no changes made" });
            res.status(200).json(updatedAcademicInstruction);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedAcademicInstruction = await AcademicInstructionModel.delete(id);
            if (!deletedAcademicInstruction) return res.status(404).json({ message: "Academic instruction not found" });
            res.status(200).json(deletedAcademicInstruction);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
