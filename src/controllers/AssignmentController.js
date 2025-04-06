import { AssignmentModel } from "../models/AssignmentModel.js";

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

    static async getAssignmentsByStudentId(req, res) {
        const { id } = req.params; // Cambiado de studentId a id
        try {
            const assignments = await AssignmentModel.getByStudentId(id);
            return res.status(200).json(assignments);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async getStudentByInitCode(req, res) {
        const { initCode } = req.params;
        try {
            // Use the AssignmentModel to get the student ID
            const studentId = await AssignmentModel.getStudentByInitCode(initCode);
            if (studentId) {
                res.json(studentId);
            } else {
                res.status(404).json({ message: "No se encontró asignación para el código de consulta inicial proporcionado." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al buscar el estudiante por código de consulta inicial." });
        }
    }
    
    static async createAssignment(req, res) {
        try {
           // const internalId = req.headers["internal-id"]; // ✅ Obtener el usuario interno desde los headers

            const newAssignment = await AssignmentModel.create(req.body);
            return res.status(201).json(newAssignment);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async assignCasesEquitably(req, res) {
        try {
            // Llama al método para asignar casos balanceados
            const result = await AssignmentModel.assignCasesEquitably();
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            //const internalId = req.headers["internal-id"]; // ✅ Obtener el usuario interno desde los headers

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
            //const internalId = req.headers["internal-id"]; // ✅ Obtener el usuario interno desde los headers

            const deletedAssignment = await AssignmentModel.delete(id);
            if (!deletedAssignment) return res.status(404).json({ message: "Assignment not found" });

            return res.json({ message: "Assignment deleted", assignment: deletedAssignment });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
