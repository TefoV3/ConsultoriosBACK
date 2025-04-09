import { AssignmentModel } from "../models/AssignmentModel.js";
import { InternalUser } from "../schemas/Internal_User.js";
import { getUserId } from '../sessionData.js';

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
           const internalId = req.headers["internal-id"]; // ✅ Obtener el usuario interno desde los headers

            const newAssignment = await AssignmentModel.create(req.body, internalId);
            return res.status(201).json(newAssignment);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Endpoint para disparar la asignación equitativa de casos pendientes por área.
     * Recibe el 'area' en el body y el 'internal-id' del asignador en los headers.
     */
    static async assignPendingByArea(req, res) {
        try {
            const { area } = req.body; // Recibe el área desde el cuerpo de la solicitud
            if (!area) {
                return res.status(400).json({ message: "El parámetro 'area' es requerido en el body." });
            }

            // Obtener el ID del usuario que realiza la acción desde los headers
            const assignerId = req.headers["internal-id"];
            if (!assignerId) {
                 return res.status(400).json({ message: "El header 'internal-id' es requerido." });
                 // Considera 401 si la ausencia del header implica no autenticado
                 // return res.status(401).json({ message: "No autorizado o header 'internal-id' ausente." });
            }

            const result = await AssignmentModel.assignPendingCasesByAreaEquitably(area, assignerId);

            res.status(200).json(result); // Devuelve el mensaje y las asignaciones creadas

        } catch (error) {
            console.error("Controller Error - assignPendingByArea:", error);
            // Si el error tiene un statusCode (como el 404 que pusimos en el modelo), úsalo
            if (error.statusCode) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            // Error genérico del servidor para otros casos
            res.status(500).json({ message: "Ocurrió un error al procesar la asignación de casos." });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"]; // ✅ Obtener el usuario interno desde los headers

            const updatedAssignment = await AssignmentModel.update(id, req.body, internalId);
            if (!updatedAssignment) return res.status(404).json({ message: "Assignment not found" });

            return res.json(updatedAssignment);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async updateByInitCode(req, res) {
        try {
            const { initCode } = req.params;
            const internalId = req.headers["internal-id"]; // Obtener el usuario interno desde los headers
            const dataToUpdate = req.body;

            // Validación de parámetros necesarios
            if (!internalId) {
                return res.status(400).json({ message: "El header 'internal-id' es requerido." });
            }
            // Aunque la ruta lo requiere, una validación extra no está de más
            if (!initCode) {
                return res.status(400).json({ message: "El parámetro 'initCode' es requerido en la URL." });
            }
            // Verificar si hay datos para actualizar en el body
            if (Object.keys(dataToUpdate).length === 0) {
                return res.status(400).json({ message: "No se proporcionaron datos para actualizar en el body." });
            }

            // Llamar al método del modelo correspondiente
            const updatedAssignment = await AssignmentModel.updateByInitCode(initCode, dataToUpdate, internalId);

            // Verificar el resultado del modelo (que devuelve null si no encuentra o no actualiza)
            if (!updatedAssignment) {
                // Devolver 404 si no se encontró o no hubo cambios
                return res.status(404).json({ message: `Assignment with Init_Code ${initCode} not found or no changes made.` });
            }

            // Devolver la asignación actualizada si todo fue bien
            return res.json(updatedAssignment);

        } catch (error) {
            // Loggear el error específico del controlador
            console.error("Controller Error - updateByInitCode:", error);
            // Devolver un error 500 genérico
            return res.status(500).json({ error: `Error updating assignment by Init_Code: ${error.message}` });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"]; // ✅ Obtener el usuario interno desde los headers

            const deletedAssignment = await AssignmentModel.delete(id, internalId);
            if (!deletedAssignment) return res.status(404).json({ message: "Assignment not found" });

            return res.json({ message: "Assignment deleted", assignment: deletedAssignment });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
