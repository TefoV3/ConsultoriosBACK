import { Seguimiento_Semanal } from "../../schemas/schedules_tables/Seguimiento_Semanal_schema.js";
import { Periodo } from "../../schemas/schedules_tables/Periodo_schema.js";
import { Op } from "sequelize";

// Helper para calcular el arreglo de semanas dado un período de fechas
function calcularSemanas(periodoId, inicio, fin) {
  const semanas = [];
  let startDate = new Date(inicio);
  const endDate = new Date(fin);
  let weekNumber = 1;

  // Función que obtiene el próximo viernes a partir de una fecha dada
  function getFriday(date) {
    const day = date.getDay(); // 0: domingo, 1: lunes, ..., 5: viernes, 6: sábado
    let diff = 5 - day;
    if (diff < 0) diff += 7;
    const friday = new Date(date);
    friday.setDate(date.getDate() + diff);
    return friday;
  }

  while (startDate <= endDate) {
    const weekStart = new Date(startDate);
    let weekEnd = getFriday(weekStart);
    if (weekEnd > endDate) {
      weekEnd = new Date(endDate);
    }
    semanas.push({
      Periodo_ID: periodoId,
      Semana_Numero: weekNumber,
      Semana_Ini: weekStart.toISOString(),
      Semana_Fin: weekEnd.toISOString(),
      Semana_Horas: 0, // Al crear la semana, inicialmente no hay horas registradas
      Semana_Feriado: 0,
      Semana_Observacion: null,
      Semana_IsDeleted: false,
    });
    weekNumber++;
    // Para la siguiente semana: se asume que empieza el lunes siguiente al viernes actual (viernes +3 días)
    const nextMonday = new Date(weekEnd);
    nextMonday.setDate(nextMonday.getDate() + 3);
    startDate = nextMonday;
  }
  return semanas;
}

export class Seguimiento_SemanalModel {
  static async getSeguimientos() {
    try {
      return await Seguimiento_Semanal.findAll({ where: { Semana_IsDeleted: false } });
    } catch (error) {
      throw new Error(`Error al obtener seguimientos: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      return await Seguimiento_Semanal.findOne({
        where: { Semana_ID: id, Semana_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error al obtener seguimiento: ${error.message}`);
    }
  }

  static async getLastSeguimientoByPeriodo(periodoId) {
    try {
      return await Seguimiento_Semanal.findOne({
        where: { Periodo_ID: periodoId, Semana_IsDeleted: false },
        order: [['Semana_Numero', 'DESC']]
      });
    } catch (error) {
      throw new Error(`Error al obtener el último seguimiento: ${error.message}`);
    }
  }

  static async create(data) {
    try {
      return await Seguimiento_Semanal.create(data);
    } catch (error) {
      throw new Error(`Error al crear seguimiento: ${error.message}`);
    }
  }

  // Bulk create
  static async createBulk(data) {
    try {
      return await Seguimiento_Semanal.bulkCreate(data);
    } catch (error) {
      throw new Error(`Error al crear seguimiento: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      const oldSeguimiento = await this.getById(id);
      if (!oldSeguimiento) return null;
      const oldHoras = oldSeguimiento.Semana_Horas || 0;

      const [rowsUpdated] = await Seguimiento_Semanal.update(data, {
        where: { Semana_ID: id, Semana_IsDeleted: false }
      });
      if (rowsUpdated === 0) return null;

      const updatedSeguimiento = await this.getById(id);
      const newHoras = updatedSeguimiento.Semana_Horas || 0;
      const diferencia = newHoras - oldHoras;
      if (diferencia !== 0) {
        if (diferencia > 0) {
          await Periodo.increment(
            { Periodo_Total_Horas: diferencia },
            { where: { Periodo_ID: updatedSeguimiento.Periodo_ID } }
          );
        } else {
          await Periodo.decrement(
            { Periodo_Total_Horas: Math.abs(diferencia) },
            { where: { Periodo_ID: updatedSeguimiento.Periodo_ID } }
          );
        }
      }
      return updatedSeguimiento;
    } catch (error) {
      throw new Error(`Error al actualizar seguimiento: ${error.message}`);
    }
  }

  // Método para recalcular el total de horas del período a partir de las semanas activas
  static async recalcularTotalHoras(periodoId) {
    try {
      const semanasVigentes = await Seguimiento_Semanal.findAll({
        where: { Periodo_ID: periodoId, Semana_IsDeleted: false }
      });
      const totalHoras = semanasVigentes.reduce((acc, sem) => acc + (parseFloat(sem.Semana_Horas) || 0), 0);
      await Periodo.update({ Periodo_Total_Horas: totalHoras }, { where: { Periodo_ID: periodoId } });
      return totalHoras;
    } catch (error) {
      throw new Error(`Error al recalcular total de horas: ${error.message}`);
    }
  }

  /**
   * Recalcula las semanas para un período a partir de una nueva fecha de inicio y la fecha de fin actual.
   * El método:
   *  1. Obtiene todas las semanas activas para el período.
   *  2. Identifica las semanas cuyo inicio es anterior a la nueva fecha y las marca como eliminadas.
   *  3. Genera en bulk nuevas semanas para cubrir el segmento faltante al inicio y/o al final.
   *  4. Renumera todas las semanas activas de forma consecutiva.
   *  5. Recalcula el total de horas del período a partir de las semanas activas.
   *
   * @param {number} periodoId - El ID del período.
   * @param {Date} nuevaFechaInicio - La nueva fecha de inicio.
   * @param {Date} fechaFin - La fecha de fin del período.
   * @returns {Promise<Object>} Objeto con las semanas activas y el total recalculado.
   */
  static async recalcularSemanas(periodoId, nuevaFechaInicio, fechaFin) {
    try {
      // 1. Obtener todas las semanas activas para el período
      const semanasActuales = await Seguimiento_Semanal.findAll({
        where: { Periodo_ID: periodoId, Semana_IsDeleted: false }
      });

      // 2. Identificar las semanas que se eliminarán (inicio < nuevaFechaInicio)
      const semanasAEliminar = semanasActuales.filter(
        (sem) => new Date(sem.Semana_Ini) < nuevaFechaInicio
      );

      // 3. Marcar como eliminadas las semanas identificadas
      if (semanasAEliminar.length > 0) {
        await Seguimiento_Semanal.update(
          { Semana_IsDeleted: true },
          { where: { Semana_ID: { [Op.in]: semanasAEliminar.map((s) => s.Semana_ID) } } }
        );
      }

      // 4. Generar nuevas semanas para el segmento faltante al inicio
      let nuevasSemanasInicio = [];
      if (semanasAEliminar.length > 0) {
        const minSemanaIni = new Date(
          Math.min(...semanasAEliminar.map((s) => new Date(s.Semana_Ini).getTime()))
        );
        if (nuevaFechaInicio < minSemanaIni) {
          nuevasSemanasInicio = calcularSemanas(periodoId, nuevaFechaInicio, minSemanaIni);
        }
      }
      if (nuevasSemanasInicio.length > 0) {
        await Seguimiento_Semanal.bulkCreate(nuevasSemanasInicio);
      }

      // 5. Si la nueva fecha de fin es mayor que el final de la última semana activa, crear semanas adicionales
      const ultimaSemanaActiva = await Seguimiento_Semanal.findOne({
        where: { Periodo_ID: periodoId, Semana_IsDeleted: false },
        order: [["Semana_Fin", "DESC"]]
      });
      if (ultimaSemanaActiva) {
        const lastWeekEnd = new Date(ultimaSemanaActiva.Semana_Fin);
        if (fechaFin > lastWeekEnd) {
          const nextDay = new Date(lastWeekEnd);
          nextDay.setDate(nextDay.getDate() + 1);
          const nuevasSemanasFin = calcularSemanas(periodoId, nextDay, fechaFin);
          if (nuevasSemanasFin.length > 0) {
            await Seguimiento_Semanal.bulkCreate(nuevasSemanasFin);
          }
        }
      }

      // 6. Renumerar todas las semanas activas en orden cronológico
      let semanasVigentes = await Seguimiento_Semanal.findAll({
        where: { Periodo_ID: periodoId, Semana_IsDeleted: false },
        order: [["Semana_Ini", "ASC"]]
      });
      let counter = 1;
      for (const sem of semanasVigentes) {
        sem.Semana_Numero = counter++;
        await sem.save();
      }

      // 7. Recalcular el total de horas de las semanas activas y actualizar el período
      semanasVigentes = await Seguimiento_Semanal.findAll({
        where: { Periodo_ID: periodoId, Semana_IsDeleted: false }
      });
      const totalHorasVigentes = semanasVigentes.reduce(
        (acc, sem) => acc + (parseFloat(sem.Semana_Horas) || 0),
        0
      );
      await Periodo.update(
        { Periodo_Total_Horas: totalHorasVigentes },
        { where: { Periodo_ID: periodoId } }
      );

      return { semanas: semanasVigentes, totalHoras: totalHorasVigentes };
    } catch (error) {
      throw new Error(`Error al recalcular semanas: ${error.message}`);
    }
  }
  
  static async delete(id) {
    try {
      const seguimiento = await this.getById(id);
      if (!seguimiento) return null;
      await Seguimiento_Semanal.update(
        { Semana_IsDeleted: true },
        { where: { Semana_ID: id, Semana_IsDeleted: false } }
      );
      return seguimiento;
    } catch (error) {
      throw new Error(`Error al eliminar seguimiento: ${error.message}`);
    }
  }
}
