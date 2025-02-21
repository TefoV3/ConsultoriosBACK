import { Actividad } from "../schemas/Actividad.js";

export class ActividadModel {

    static async getAll() {
        try {
            return await Actividad.findAll();
        } catch (error) {
            throw new Error(`Error al obtener actividades: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Actividad.findOne({
                where: { Id_Actividad: id }
            });
        } catch (error) {
            throw new Error(`Error al obtener actividad: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Actividad.create(data);
        } catch (error) {
            throw new Error(`Error al crear actividad: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const actividad = await this.getById(id);
            if (!actividad) return null;

            const [rowsUpdated] = await Actividad.update(data, {
                where: { Id_Actividad: id }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error al actualizar actividad: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const actividad = await this.getById(id);
            if (!actividad) return null;

            await Actividad.destroy({ where: { Id_Actividad: id } });
            return actividad;
        } catch (error) {
            throw new Error(`Error al eliminar actividad: ${error.message}`);
        }
    }
}
