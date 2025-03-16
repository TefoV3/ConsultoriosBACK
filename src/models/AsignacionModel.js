import { Assignment } from "../schemas/Asignacion.js";

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

    static async create(data) {
        try {
            return await Assignment.create(data);
        } catch (error) {
            throw new Error(`Error creating assignment: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const assignment = await this.getById(id);
            if (!assignment) return null;

            const [rowsUpdated] = await Assignment.update(data, {
                where: { Assignment_Id: id }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating assignment: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const assignment = await this.getById(id);
            if (!assignment) return null;

            await Assignment.destroy({ where: { Assignment_Id: id } });
            return assignment;
        } catch (error) {
            throw new Error(`Error deleting assignment: ${error.message}`);
        }
    }
}
