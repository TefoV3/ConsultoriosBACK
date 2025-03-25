import { Horas_Extraordinarias } from "../../schemas/schedules_tables/Horas_Extraordinarias_schema.js";

export class Horas_ExtraordinariasModel {
    
    /** 🔹 Obtener todas las horas extraordinarias activas */
    static async getHoras_Extraordinarias() {
        try {
            return await Horas_Extraordinarias.findAll({
                where: { Horas_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error al obtener horas extraordinarias: ${error.message}`);
        }
    }

    /** 🔹 Obtener una hora extraordinaria por ID */
    static async getById(id) {
        try {
            return await Horas_Extraordinarias.findOne({
                where: { Horas_ID: id, Horas_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error al obtener horas extraordinarias: ${error.message}`);
        }
    }

    /** 🔹 Crear nuevo registro */
    static async create(data) {
        try {
            return await Horas_Extraordinarias.create(data);
        } catch (error) {
            throw new Error(`Error al crear horas extraordinarias: ${error.message}`);
        }
    }

    /** 🔹 Actualizar un registro */
    static async update(id, data) {
        try {
            const horasExtraordinarias = await this.getById(id);

            if (!horasExtraordinarias) return null;

            const [rowsUpdated] = await Horas_Extraordinarias.update(data, {
                where: { Horas_ID: id, Horas_IsDeleted: false }
            });

            if (rowsUpdated === 0) return null;

            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error al actualizar horas extraordinarias: ${error.message}`);
        }
    }

    /** 🔹 Eliminar lógico */
    static async delete(id) {
        try {
            const horasExtraordinarias = await this.getById(id);

            if (!horasExtraordinarias) return null;

            await Horas_Extraordinarias.update(
                { Horas_IsDeleted: true },
                { where: { Horas_ID: id, Horas_IsDeleted: false } }
            );

            return await Horas_Extraordinarias.findOne({ where: { Horas_ID: id } });
        } catch (error) {
            throw new Error(`Error al eliminar horas extraordinarias: ${error.message}`);
        }
    }

    /** 🔹 Obtener todas las horas extraordinarias por usuario (Internal_ID) */
    static async getHoras_ExtraordinariasByUser(id) {
        try {
            return await Horas_Extraordinarias.findAll({
                where: { Internal_ID: id, Horas_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error al obtener horas extraordinarias por usuario: ${error.message}`);
        }
    }
}
