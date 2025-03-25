import { Horarios } from "../../schemas/schedules_tables/Horario_schema.js";
import { sequelize } from "../../database/database.js";
import { QueryTypes } from "sequelize";
//../../schemas/schedules_tables/
export class HorarioModel {
    static async getHorarios() {
        try {
            return await Horarios.findAll({ where: { Horario_IsDeleted: false } });
        } catch (error) {
            throw new Error(`Error al obtener horarios: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Horarios.findOne({
                where: { Horario_ID: id, Horario_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error al obtener horario: ${error.message}`);
        }
    }

    static async getDisponibilidadHorario(periodoId, area, dia) {

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

        try {
            const query = `
                SELECT 
                    SUM(CASE WHEN p.Parametro_Horario_Tipo = 'Temprano' THEN 1 ELSE 0 END) AS cantidadTemprano,
                    SUM(CASE WHEN p.Parametro_Horario_Tipo = 'Tarde' THEN 1 ELSE 0 END) AS cantidadTarde
                FROM Horarios h
                INNER JOIN UsuarioXPeriodos ux ON h.UsuarioXPeriodo_ID = ux.UsuarioXPeriodo_ID
                INNER JOIN Internal_User u ON ux.Internal_ID = u.Internal_ID
                INNER JOIN Parametro_Horarios p ON h.${columnaDia} = p.Parametro_Horario_ID
                WHERE 
                    ux.Periodo_ID = :periodoId
                    AND u.Internal_Area = :area
                    AND h.Horario_IsDeleted = 0
            `;
        

            const [resultado] = await sequelize.query(query, {
                replacements: { periodoId, area },
                type: QueryTypes.SELECT
            });

            return resultado;

        } catch (error) {
            console.error(`❌ Error al obtener disponibilidad de horario: ${error.message}`);
            throw new Error(`Error al obtener disponibilidad de horario: ${error.message}`);
        }
    }

    static async getHorarioByUsuarioXPeriodo(usuarioXPeriodoId) {
        try {
            const horario = await Horarios.findOne({
                where: {
                    UsuarioXPeriodo_ID: usuarioXPeriodoId,
                    Horario_IsDeleted: false
                }
            });
            return horario;
        } catch (error) {
            console.error(`❌ Error al obtener Horario: ${error.message}`);
            throw new Error(`Error al buscar horario: ${error.message}`);
        }
    }


    static async create(data) {
        try {
            return await Horarios.create(data);
        } catch (error) {
            console.error(`❌ Error al crear horario: ${error.message}`);
            throw new Error(`Error al crear horario: ${error.message}`);
        }
    }

    static async cambioAdministrativo(usuarioXPeriodoId, nuevoHorario) {
        const transaccion = await sequelize.transaction();
        try {
            // 1️⃣ Marcar actuales como IsDeleted = true
            await Horarios.update(
                { Horario_IsDeleted: true },
                {
                    where: { 
                        UsuarioXPeriodo_ID: usuarioXPeriodoId,
                        Horario_IsDeleted: false
                    },
                    transaction: transaccion
                }
            );

            // 2️⃣ Crear nuevo horario
            const horarioCreado = await Horarios.create({
                UsuarioXPeriodo_ID: usuarioXPeriodoId,
                Horario_Dia_Lunes: nuevoHorario.Horario_Dia_Lunes,
                Horario_Dia_Martes: nuevoHorario.Horario_Dia_Martes,
                Horario_Dia_Miercoles: nuevoHorario.Horario_Dia_Miercoles,
                Horario_Dia_Jueves: nuevoHorario.Horario_Dia_Jueves,
                Horario_Dia_Viernes: nuevoHorario.Horario_Dia_Viernes,
                Horario_Modalidad: nuevoHorario.Horario_Modalidad,
                Horario_IsDeleted: false
            }, { transaction: transaccion });

            // 3️⃣ Confirmar la transacción
            await transaccion.commit();

            return { ok: true, mensaje: "Horario actualizado con cambio administrativo" };

        } catch (error) {
            await transaccion.rollback();
            console.error(`❌ Error en cambio administrativo: ${error.message}`);
            return { ok: false, mensaje: `Error al realizar cambio administrativo: ${error.message}` };
        }
    }

    static async getHorarioByUsuarioXPeriodo(usuarioXPeriodoId) {
        try {
            return await Horarios.findOne({
                where: {
                    UsuarioXPeriodo_ID: usuarioXPeriodoId,
                    Horario_IsDeleted: false
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener horario por UsuarioXPeriodo: ${error.message}`);
        }
    }
    
    static async getHorariosCompletos(periodoId, area) {
        try {
            const query = `
            SELECT 
              h.Horario_ID,
              h.UsuarioXPeriodo_ID,
              h.Horario_Modalidad,
              h.createdAt,
              h.updatedAt,
              
              h.Horario_Dia_Lunes,
              phL.Parametro_Horario_Hora_Entrada AS Lunes_Entrada,
              phL.Parametro_Horario_Hora_Salida  AS Lunes_Salida,
              phL.Parametro_Horario_Tipo        AS Lunes_Tipo,
              
              h.Horario_Dia_Martes,
              phM.Parametro_Horario_Hora_Entrada AS Martes_Entrada,
              phM.Parametro_Horario_Hora_Salida  AS Martes_Salida,
              phM.Parametro_Horario_Tipo        AS Martes_Tipo,
              
              h.Horario_Dia_Miercoles,
              phMi.Parametro_Horario_Hora_Entrada AS Miercoles_Entrada,
              phMi.Parametro_Horario_Hora_Salida  AS Miercoles_Salida,
              phMi.Parametro_Horario_Tipo        AS Miercoles_Tipo,
              
              h.Horario_Dia_Jueves,
              phJ.Parametro_Horario_Hora_Entrada AS Jueves_Entrada,
              phJ.Parametro_Horario_Hora_Salida  AS Jueves_Salida,
              phJ.Parametro_Horario_Tipo        AS Jueves_Tipo,
              
              h.Horario_Dia_Viernes,
              phV.Parametro_Horario_Hora_Entrada AS Viernes_Entrada,
              phV.Parametro_Horario_Hora_Salida  AS Viernes_Salida,
              phV.Parametro_Horario_Tipo        AS Viernes_Tipo,
              
              u.Internal_ID,
              u.Internal_Name,
              u.Internal_LastName,
              u.Internal_Area
            FROM Horarios h
            INNER JOIN UsuarioXPeriodos ux ON h.UsuarioXPeriodo_ID = ux.UsuarioXPeriodo_ID
            INNER JOIN Internal_User u ON ux.Internal_ID = u.Internal_ID
            LEFT JOIN Parametro_Horarios phL 
              ON h.Horario_Dia_Lunes = phL.Parametro_Horario_ID AND phL.Parametro_Horario_IsDeleted = false
            LEFT JOIN Parametro_Horarios phM 
              ON h.Horario_Dia_Martes = phM.Parametro_Horario_ID AND phM.Parametro_Horario_IsDeleted = false
            LEFT JOIN Parametro_Horarios phMi 
              ON h.Horario_Dia_Miercoles = phMi.Parametro_Horario_ID AND phMi.Parametro_Horario_IsDeleted = false
            LEFT JOIN Parametro_Horarios phJ 
              ON h.Horario_Dia_Jueves = phJ.Parametro_Horario_ID AND phJ.Parametro_Horario_IsDeleted = false
            LEFT JOIN Parametro_Horarios phV 
              ON h.Horario_Dia_Viernes = phV.Parametro_Horario_ID AND phV.Parametro_Horario_IsDeleted = false
            WHERE ux.Periodo_ID = :periodoId
              AND u.Internal_Area = :area
              AND h.Horario_IsDeleted = false
            ORDER BY h.Horario_ID;
          `;
          
          
          const horarios = await sequelize.query(query, {
            replacements: { periodoId, area },
            type: QueryTypes.SELECT
          });
          
          return horarios;
        } catch (error) {
          throw new Error(`Error al obtener horarios completos: ${error.message}`);
        }
      }
    


    static async update(id, data) {
        try {
            const horario = await this.getById(id);

            if (!horario) return null;

            const [rowsUpdated] = await Horarios.update(data, {
                where: { Horario_ID: id, Horario_IsDeleted: false }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error al actualizar horario: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const horario = await this.getById(id);

            if (!horario) return null;

            await Horarios.update(
                { Horario_IsDeleted: true },
                { where: { Horario_ID: id, Horario_IsDeleted: false } }
            );
            return horario;
        } catch (error) {
            throw new Error(`Error al eliminar horario: ${error.message}`);
        }
    }

    //TODO: Add extra method for next functions depending of mockups and UsuarioXPeriodo
}