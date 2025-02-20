import { Asignacion } from "../schemas/Asignacion_schema.js";

export class AsignacionModel {

    static async getAll() {
        try {
            return await Asignacion.findAll();
        } catch (error) {
            throw new Error(`Error al obtener asignaciones: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Asignacion.findOne({
                where: { Id_Asignacion: id }
            });
        } catch (error) {
            throw new Error(`Error al obtener asignación: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Asignacion.create(data);
        } catch (error) {
            throw new Error(`Error al crear asignación: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const asignacion = await this.getById(id);
            if (!asignacion) return null;

            const [rowsUpdated] = await Asignacion.update(data, {
                where: { Id_Asignacion: id }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error al actualizar asignación: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const asignacion = await this.getById(id);
            if (!asignacion) return null;

            await Asignacion.destroy({ where: { Id_Asignacion: id } });
            return asignacion;
        } catch (error) {
            throw new Error(`Error al eliminar asignación: ${error.message}`);
        }
    }
}
