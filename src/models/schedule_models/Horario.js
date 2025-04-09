import { Horarios } from "../../schemas/schedules_tables/Horario_schema.js";
import { sequelize } from "../../database/database.js";
import { QueryTypes } from "sequelize";

export class HorarioModel {
  // Obtener todos los horarios activos
  static async getHorarios() {
    try {
      return await Horarios.findAll({ where: { Horario_IsDeleted: false } });
    } catch (error) {
      throw new Error(`Error al obtener horarios: ${error.message}`);
    }
  }

  // Obtener un horario por ID (único registro)
  static async getById(id) {
    try {
      return await Horarios.findOne({
        where: { Horario_ID: id, Horario_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error al obtener horario: ${error.message}`);
    }
  }

  // Obtener todos los horarios asignados a un usuarioXPeriodo (podrían ser 1 o 2)
  static async getHorariosByUsuarioXPeriodo(usuarioXPeriodoId) {
    try {
      return await Horarios.findAll({
        where: {
          UsuarioXPeriodo_ID: usuarioXPeriodoId,
          Horario_IsDeleted: false
        }
      });
    } catch (error) {
      throw new Error(`Error al obtener horarios por UsuarioXPeriodo: ${error.message}`);
    }
  }

  // Consultar la disponibilidad para un día concreto (sumando cupos disponibles según tipo)
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
        INNER JOIN Internal_Users u ON ux.Internal_ID = u.Internal_ID
        INNER JOIN Parametro_Horarios p ON h.${columnaDia} = p.Parametro_Horario_ID
        WHERE 
          ux.Periodo_ID = :periodoId
          AND u.Internal_Area = :area
          AND h.Horario_Modalidad = 'Presencial'
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

  // Crear un nuevo horario (para un registro único)
  static async create(data) {
    try {
      return await Horarios.create(data);
    } catch (error) {
      console.error(`❌ Error al crear horario: ${error.message}`);
      throw new Error(`Error al crear horario: ${error.message}`);
    }
  }

  // Cambio administrativo: se eliminan lógicamente TODOS los horarios activos para el usuario
  // y se crean nuevos registros (uno o dos) según lo enviado en el arreglo "nuevosHorarios"
  static async cambioAdministrativo(usuarioXPeriodoId, nuevosHorarios) {
    const transaccion = await sequelize.transaction();
    try {
      // Marcar todos los horarios actuales de ese usuario como eliminados
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
      // Crear cada uno de los nuevos horarios (puede ser 1 o 2)
      for (const nuevoHorario of nuevosHorarios) {
        await Horarios.create({
          UsuarioXPeriodo_ID: usuarioXPeriodoId,
          Horario_Dia_Lunes: nuevoHorario.Horario_Dia_Lunes,
          Horario_Dia_Martes: nuevoHorario.Horario_Dia_Martes,
          Horario_Dia_Miercoles: nuevoHorario.Horario_Dia_Miercoles,
          Horario_Dia_Jueves: nuevoHorario.Horario_Dia_Jueves,
          Horario_Dia_Viernes: nuevoHorario.Horario_Dia_Viernes,
          Horario_Modalidad: nuevoHorario.Horario_Modalidad,
          Horario_IsDeleted: false
        }, { transaction: transaccion });
      }
      await transaccion.commit();
      return { ok: true, mensaje: "Horario actualizado con cambio administrativo" };
    } catch (error) {
      await transaccion.rollback();
      console.error(`❌ Error en cambio administrativo: ${error.message}`);
      return { ok: false, mensaje: `Error al realizar cambio administrativo: ${error.message}` };
    }
  }

  // Actualizar un único registro de horario
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

  // Eliminar (marcar como eliminado) un registro de horario
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

  // Obtener horarios completos (con información unida de parámetros y usuario)
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
        INNER JOIN Internal_Users u ON ux.Internal_ID = u.Internal_ID
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
      console.log(error);
      throw new Error(`Error al obtener horarios completos: ${error.message}`);
    }
  }
}
