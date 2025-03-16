import { AssignmentModel } from "../models/AsignacionModel.js";

export class AssignmentController {
    static async getAssignments(req, res) {
        try {
            const assignments = await AssignmentModel.getAll();
            res.json(assignments);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const assignment = await AssignmentModel.getById(id);
            if (assignment) return res.json(assignment);
            res.status(404).json({ message: "Assignment not found" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createAssignment(req, res) {
        try {
            const newAssignment = await AssignmentModel.create(req.body);
            return res.status(201).json(newAssignment);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedAssignment = await AssignmentModel.update(id, req.body);
            if (!updatedAssignment) return res.status(404).json({ message: "Assignment not found" });

            return res.json(updatedAssignment);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedAssignment = await AssignmentModel.delete(id);
            if (!deletedAssignment) return res.status(404).json({ message: "Assignment not found" });

            return res.json({ message: "Assignment deleted", assignment: deletedAssignment });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
