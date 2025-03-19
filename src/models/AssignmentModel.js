import { AuditModel } from "../models/AuditModel.js";
import { Assignment } from "../schemas/Assignment_schema.js";

export class AssignmentModel {

    static async getAll() {
        try {
            return await Assignment.findAll();
        } catch (error) {
            throw new Error(`Error retrieving assignments: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Assignment.findOne({
                where: { Assignment_Id: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving assignment: ${error.message}`);
        }
    }

    static async create(data, internalId) {
        try {
            const newAssignment = await Assignment.create(data);

            // 🔹 Registrar en Audit que un usuario interno creó una asignación
            await AuditModel.registerAudit(
                internalId, 
                "INSERT",
                "Assignment",
                `El usuario interno ${internalId} creó la asignación con ID ${newAssignment.Assignment_Id}`
            );

            return newAssignment;
        } catch (error) {
            throw new Error(`Error creating assignment: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const assignment = await this.getById(id);
            if (!assignment) return null;

            const [rowsUpdated] = await Assignment.update(data, {
                where: { Assignment_Id: id }
            });

            if (rowsUpdated === 0) return null;

            const updatedAssignment = await this.getById(id);

            // 🔹 Registrar en Audit que un usuario interno actualizó una asignación
            await AuditModel.registerAudit(
                internalId, 
                "UPDATE",
                "Assignment",
                `El usuario interno ${internalId} actualizó la asignación con ID ${id}`
            );

            return updatedAssignment;
        } catch (error) {
            throw new Error(`Error updating assignment: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const assignment = await this.getById(id);
            if (!assignment) return null;

            await Assignment.destroy({ where: { Assignment_Id: id } });

            // 🔹 Registrar en Audit que un usuario interno eliminó una asignación
            await AuditModel.registerAudit(
                internalId, 
                "DELETE",
                "Assignment",
                `El usuario interno ${internalId} eliminó la asignación con ID ${id}`
            );

            return assignment;
        } catch (error) {
            throw new Error(`Error deleting assignment: ${error.message}`);
        }
    }
}

