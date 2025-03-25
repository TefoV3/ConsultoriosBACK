import { Periodo } from "../../schemas/schedules_tables/Periodo_schema.js";

export class PeriodoModel {

    /** 🔹 Obtener todos los períodos activos */
    static async getPeriodos() {
        try {
            return await Periodo.findAll({ where: { Periodo_IsDeleted: false } });
        } catch (error) {
            throw new Error(`Error al obtener períodos: ${error.message}`);
        }
    }

    /** 🔹 Obtener un período por ID, solo si no está eliminado */
    static async getById(id) {
        try {
            return await Periodo.findOne({
                where: { Periodo_ID: id, Periodo_IsDeleted: false } // ✅ Filtro de eliminado
            });
        } catch (error) {
            throw new Error(`Error al obtener período: ${error.message}`);
        }
    }

    /** 🔹 Crear un nuevo período */
    //TODO: BULK CREATE
    static async create(data) {
        try {
            console.log(data);
            return await Periodo.create(data);
        } catch (error) {
            throw new Error(`Error al crear período: ${error.message}`);
        }
    }

    /** 🔹 Actualizar un período solo si no está eliminado (reutilizando getById) */
    static async update(id, data) {
        try {
            const periodo = await this.getById(id); // ✅ Reutiliza getById para verificar si el período existe

            if (!periodo) return null; // 🔹 Si el período no existe o está eliminado

            const [rowsUpdated] = await Periodo.update(data, {
                where: { Periodo_ID: id, Periodo_IsDeleted: false } // ✅ Aplica el filtro en la actualización
            });

            if (rowsUpdated === 0) return null; // 🔹 Si no se actualizó nada
            return await this.getById(id); // ✅ Retorna el período actualizado
        } catch (error) {
            throw new Error(`Error al actualizar período: ${error.message}`);
        }
    }

    /** 🔹 Eliminar período (marcado lógico) solo si no está eliminado (reutilizando getById) */
    static async delete(id) {
        try {
            const periodo = await this.getById(id); // ✅ Reutiliza getById para verificar si el período existe

            if (!periodo) return null; // 🔹 Si el período no existe o ya está eliminado

            await Periodo.update(
                { Periodo_IsDeleted: true }, // 🔹 Marcar como eliminado
                { where: { Periodo_ID: id, Periodo_IsDeleted: false } } // ✅ Solo si no está eliminado ya
            );

            return await Periodo.findOne({ where: { Periodo_ID: id } }); // Retorna el período actualizado
        } catch (error) {
            throw new Error(`Error al eliminar período: ${error.message}`);
        }
    }
}
