import { Seguimiento_Semanal } from "../../schemas/schedules_tables/Seguimiento_Semanal_schema.js";
import { Periodo } from "../../schemas/schedules_tables/Periodo_schema.js";
import { Op } from "sequelize";

// Helper para calcular el arreglo de semanas dado un período de fechas
function calcularSemanas(periodoId, inicio, fin) {
  const semanas = [];
  let startDate = new Date(inicio);
  const endDate = new Date(fin);
  let weekNumber = 1;

  // Funciones auxiliares
  function getDayName(date) {
    return ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][date.getDay()];
  }

  function getFriday(fromDate) {
    const day = fromDate.getDay(); // 0: domingo, 1: lunes, ..., 6: sábado
    const diff = 5 - day;
    const friday = new Date(fromDate);
    friday.setDate(fromDate.getDate() + diff);
    return friday;
  }

  function getNextMonday(date) {
    const monday = new Date(date);
    const day = monday.getDay();
    const diff = (8 - day) % 7; // días hasta el siguiente lunes
    monday.setDate(monday.getDate() + diff);
    return monday;
  }

  // 🟡 Semana parcial si no es lunes
  if (startDate.getDay() !== 1) {
    let weekEnd = getFriday(startDate);
    if (weekEnd > endDate) weekEnd = new Date(endDate);

    semanas.push({
      Periodo_ID: periodoId,
      Semana_Numero: weekNumber++,
      Semana_Ini: startDate.toISOString(),
      Semana_Fin: weekEnd.toISOString(),
      Semana_Horas: 0,
      Semana_Feriado: 0,
      Semana_Observacion: null,
      Semana_IsDeleted: false,
    });

    // Avanzamos al próximo lunes
    startDate = getNextMonday(startDate);
  }

  // 🔵 Semanas completas de lunes a viernes
  while (startDate <= endDate) {
    const weekStart = new Date(startDate);
    let weekEnd = getFriday(weekStart);
    if (weekEnd > endDate) weekEnd = new Date(endDate);

    semanas.push({
      Periodo_ID: periodoId,
      Semana_Numero: weekNumber++,
      Semana_Ini: weekStart.toISOString(),
      Semana_Fin: weekEnd.toISOString(),
      Semana_Horas: 0,
      Semana_Feriado: 0,
      Semana_Observacion: null,
      Semana_IsDeleted: false,
    });

    startDate.setDate(startDate.getDate() + 7); // siguiente lunes
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
      const old = await this.getById(id);
      if (!old) return null;
  
      const oldHoras = parseFloat(old.Semana_Horas) || 0;
      const oldFeriado = parseFloat(old.Semana_Feriado) || 0;
  
      const newHoras = 'Semana_Horas' in data ? parseFloat(data.Semana_Horas) || 0 : oldHoras;
      const newFeriado = 'Semana_Feriado' in data ? parseFloat(data.Semana_Feriado) || 0 : oldFeriado;
  
      // ⚠️ Validar lógica de feriado antes de actualizar
      if (newFeriado > newHoras) {
        throw new Error("Las horas de feriado no pueden ser mayores que las horas de la semana.");
      }
  
      // Calculamos la diferencia neta para ajustar el total del período
      const oldNet = oldHoras - oldFeriado;
      const newNet = newHoras - newFeriado;
      const diferencia = newNet - oldNet;
  
      await Seguimiento_Semanal.update(data, {
        where: { Semana_ID: id, Semana_IsDeleted: false }
      });
  
      if (diferencia !== 0) {
        if (diferencia > 0) {
          await Periodo.increment(
            { Periodo_Total_Horas: diferencia },
            { where: { Periodo_ID: old.Periodo_ID } }
          );
        } else {
          await Periodo.decrement(
            { Periodo_Total_Horas: Math.abs(diferencia) },
            { where: { Periodo_ID: old.Periodo_ID } }
          );
        }
      }
  
      return await this.getById(id);
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
      const totalHoras = semanasVigentes.reduce((acc, sem) => {
        const horas = parseFloat(sem.Semana_Horas) || 0;
        const feriado = parseFloat(sem.Semana_Feriado) || 0;
        const netas = Math.max(0, horas - feriado);
        return acc + netas;
      }, 0);     
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
      // Obtener semanas actuales activas ordenadas cronológicamente
      const semanasActuales = await Seguimiento_Semanal.findAll({
        where: { Periodo_ID: periodoId, Semana_IsDeleted: false },
        order: [["Semana_Ini", "ASC"]]
      });
  
      // Calcular las nuevas semanas basadas en las fechas proporcionadas
      const nuevasSemanas = calcularSemanas(periodoId, nuevaFechaInicio, fechaFin);
  
      // Recorrer cada una para actualizar o crear
      for (let i = 0; i < nuevasSemanas.length; i++) {
        const nueva = nuevasSemanas[i];
  
        if (i < semanasActuales.length) {
          // Reutilizamos la semana existente y actualizamos fechas y número
          await Seguimiento_Semanal.update(
            {
              Semana_Numero: i + 1,
              Semana_Ini: nueva.Semana_Ini,
              Semana_Fin: nueva.Semana_Fin
              // Se mantienen horas, feriados y observaciones tal como están
            },
            {
              where: { Semana_ID: semanasActuales[i].Semana_ID }
            }
          );
        } else {
          // Si hay más nuevas que actuales, las restantes se crean
          nueva.Semana_Numero = i + 1;
          await Seguimiento_Semanal.create(nueva);
        }
      }
  
      // Si había más semanas antes, las sobrantes se marcan como eliminadas
      if (semanasActuales.length > nuevasSemanas.length) {
        const semanasSobrantes = semanasActuales.slice(nuevasSemanas.length);
        const ids = semanasSobrantes.map(s => s.Semana_ID);
        await Seguimiento_Semanal.update(
          { Semana_IsDeleted: true },
          { where: { Semana_ID: { [Op.in]: ids } } }
        );
      }
  
      // Renumerar en orden (por si acaso algo quedó fuera de secuencia)
      const semanasFinales = await Seguimiento_Semanal.findAll({
        where: { Periodo_ID: periodoId, Semana_IsDeleted: false },
        order: [["Semana_Ini", "ASC"]]
      });
  
      let contador = 1;
      for (const semana of semanasFinales) {
        semana.Semana_Numero = contador++;
        await semana.save();
      }
  
      // Recalcular horas totales
      const totalHoras = semanasFinales.reduce((acc, s) => {
        const horas = parseFloat(s.Semana_Horas) || 0;
        const feriado = parseFloat(s.Semana_Feriado) || 0;
        const netas = Math.max(0, horas - feriado);
        return acc + netas;
      }, 0);

      
      await Periodo.update(
        { Periodo_Total_Horas: totalHoras },
        { where: { Periodo_ID: periodoId } }
      );
  
      return { semanas: semanasFinales, totalHoras };
  
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
