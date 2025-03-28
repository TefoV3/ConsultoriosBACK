import { Parametro_Horario } from "../../schemas/schedules_tables/Parametro_Horario_schema.js";
import { sequelize } from "../../database/database.js";
import { QueryTypes } from "sequelize";

export class Parametro_HorarioModel {
    /** 🔹 Obtener todos los registros activos */
    static async getParametro_Horarios() {
        try {
            return await Parametro_Horario.findAll({
                where: { Parametro_Horario_IsDeleted: false }
            });
        } catch (error) {
            console.error(`❌ Error al obtener parametro_horario: ${error.message}`);
            throw new Error(`Error al obtener parametro_horario: ${error.message}`);
        }
    }

    /** 🔹 Obtener un registro por clave primaria, solo si no está eliminado */
    static async getById(parametroHorarioId) {
        try {
            return await Parametro_Horario.findOne({
                where: { Parametro_Horario_ID: parametroHorarioId, Parametro_Horario_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error al obtener parametro_horario: ${error.message}`);
        }
    }

    static async getHorariosDisponiblesPorTipo(tipo, periodoId, area, dia) {
      try {
          const columnaDia = {
              'Lunes': 'Horario_Dia_Lunes',
              'Martes': 'Horario_Dia_Martes',
              'Miercoles': 'Horario_Dia_Miercoles',
              'Jueves': 'Horario_Dia_Jueves',
              'Viernes': 'Horario_Dia_Viernes'
          }[dia];
  
          if (!columnaDia) {
              throw new Error(`Día no válido: ${dia}`);
          }
  
          let query = `
              SELECT ph.Parametro_Horario_ID,
                     ph.Parametro_Horario_Hora_Entrada,
                     ph.Parametro_Horario_Hora_Salida,
                     ph.Parametro_Horario_Tipo
              FROM Parametro_Horarios ph
              WHERE ph.Parametro_Horario_IsDeleted = 0
                AND ph.Parametro_Horario_Tipo = :tipo
          `;
  
          if (tipo === 'Temprano' || tipo === 'Tarde') {
              query += `
                AND (
                  SELECT COUNT(DISTINCT h.UsuarioXPeriodo_ID)
                  FROM Horarios h
                  INNER JOIN UsuarioXPeriodos ux ON h.UsuarioXPeriodo_ID = ux.UsuarioXPeriodo_ID
                  INNER JOIN Internal_Users u ON ux.Internal_ID = u.Internal_ID
                  WHERE ux.Periodo_ID = :periodoId
                    AND u.Internal_Area = :area
                    AND h.Horario_IsDeleted = 0
                    AND h.${columnaDia} IN (
                      SELECT ph2.Parametro_Horario_ID
                      FROM Parametro_Horarios ph2
                      WHERE ph2.Parametro_Horario_Tipo = :tipo
                        AND ph2.Parametro_Horario_IsDeleted = 0
                    )
                ) < 7
              `;
          }
  
          const resultados = await sequelize.query(query, {
              replacements: { tipo, periodoId, area },
              type: QueryTypes.SELECT
          });
  
          return resultados;
  
      } catch (error) {
          console.error(`❌ Error al obtener horarios disponibles: ${error.message}`);
          throw new Error(`Error al obtener horarios disponibles: ${error.message}`);
      }
  }
  
      

    /** 🔹 Crear un nuevo registro */
    static async create(parametroHorario) {
        try {
            return await Parametro_Horario.create(parametroHorario);
        } catch (error) {
            throw new Error(`Error al crear parametro_horario: ${error.message}`);
        }
    }

    /** 🔹 Actualizar un registro por clave primaria */
    static async update(parametroHorarioId, parametroHorario) {
        try {
            return await Parametro_Horario.update(parametroHorario, {
                where: { Parametro_Horario_ID: parametroHorarioId }
            });
        } catch (error) {
            throw new Error(`Error al actualizar parametro_horario: ${error.message}`);
        }
    }

    /** 🔹 Eliminar un registro por clave primaria */
    static async delete(parametroHorarioId) {
        try {
            return await Parametro_Horario.update({ Parametro_Horario_IsDeleted: true }, {
                where: { Parametro_Horario_ID: parametroHorarioId }
            });
        } catch (error) {
            throw new Error(`Error al eliminar parametro_horario: ${error.message}`);
        }
    }
}
