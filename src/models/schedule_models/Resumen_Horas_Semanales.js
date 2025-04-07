import { Resumen_Horas_Semanales } from "../../schemas/schedules_tables/Resumen_Horas_Semanales_schema.js";

export class Resumen_Horas_SemanalesModel {
    /** 🔹 Obtener todos los resúmenes semanales activos */
    static async getResumen_Horas_Semanales() {
        try {
            return await Resumen_Horas_Semanales.findAll({
                where: { ResumenSem_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error al obtener resúmenes semanales: ${error.message}`);
        }
    }

    /** 🔹 Obtener un resumen semanal por ID */
    static async getResumen_Horas_SemanalesById(id) {
        try {
            return await Resumen_Horas_Semanales.findOne({
                where: { ResumenSem_ID: id, ResumenSem_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error al obtener resumen semanal por ID: ${error.message}`);
        }
    }

    static async getResumenesByResumenGeneral(resumenGeneralId) {
        try {
          return await Resumen_Horas_Semanales.findAll({
            where: {
              ResumenGeneral_ID: resumenGeneralId,
              ResumenSem_IsDeleted: false
            },
            order: [['Semana_Inicio', 'ASC']]
          });
        } catch (error) {
          throw new Error(`Error al obtener los resúmenes semanales del resumen general: ${error.message}`);
        }
      }
      

    /** 🔹 Crear un nuevo resumen semanal */
    static async create(data) {
        try {
            return await Resumen_Horas_Semanales.create(data);
        } catch (error) {
            throw new Error(`Error al crear resumen semanal: ${error.message}`);
        }
    }

    /** 🔹 Actualizar un resumen semanal y retornar el registro actualizado */
    static async update(id, data) {
        try {
            const [rowsUpdated] = await Resumen_Horas_Semanales.update(data, {
                where: { ResumenSem_ID: id, ResumenSem_IsDeleted: false }
            });
            if (rowsUpdated === 0) return null;
            return await this.getResumen_Horas_SemanalesById(id);
        } catch (error) {
            throw new Error(`Error al actualizar resumen semanal: ${error.message}`);
        }
    }

    /** 🔹 Eliminar lógicamente un resumen semanal (retorna true si se actualizó) */
    static async delete(id) {
        try {
            const [rowsUpdated] = await Resumen_Horas_Semanales.update(
                { ResumenSem_IsDeleted: true },
                { where: { ResumenSem_ID: id, ResumenSem_IsDeleted: false } }
            );
            return rowsUpdated > 0;
        } catch (error) {
            throw new Error(`Error al eliminar resumen semanal: ${error.message}`);
        }
    }
}
