import { Registro_Asistencia } from "../../schemas/schedules_tables/Registro_Asistencia_Schema.js";
import { Resumen_Horas_EstudiantesModel} from "./Resumen_Horas_Estudiantes.js";
import { UsuarioXPeriodoModel } from "./UsuarioXPeriodo.js";
import { UsuarioXPeriodo } from "../../schemas/schedules_tables/UsuarioXPeriodo_schema.js";
import { InternalUser } from "../../schemas/Internal_User.js";
import { Periodo } from "../../schemas/schedules_tables/Periodo_schema.js";
import { Seguimiento_Semanal } from "../../schemas/schedules_tables/Seguimiento_Semanal_schema.js";
import { Resumen_Horas_Semanales } from "../../schemas/schedules_tables/Resumen_Horas_Semanales_schema.js";
import { Op, where } from "sequelize";
import { sequelize } from "../../database/database.js";
 
 export class Registro_AsistenciaModel {
  
     //Obtener registros activos
     static async getRegistros() {
         try {
             return await Registro_Asistencia.findAll({
                 where: { Registro_IsDeleted: false }
             });
         } catch (error) {
             throw new Error(`Error al obtener registros de asistencia: ${error.message}`);
         }
     }
 
     //Obtener un registro por ID, solo si no está eliminado
     static async getById(id) {
         try {
             return await Registro_Asistencia.findOne({
                 where: { Registro_ID: id, Registro_IsDeleted: false }
             });
         } catch (error) {
             throw new Error(`Error al obtener registro de asistencia: ${error.message}`);
         }
     }
 
     //Crear un nuevo registro
     static async create(data) {
         try {
             return await Registro_Asistencia.create(data);
         } catch (error) {
            console.log('Error:', error);
             throw new Error(`Error al crear registro de asistencia: ${error.message}`);
         }
     }

    // --- Método helper para actualizar el resumen semanal ---
  /**
   * Busca el seguimiento semanal (rango) en el que cae la fecha del registro,
   * y actualiza (o crea) el registro en Resumen_Horas_Semanales.
   * 
   * @param {number} periodoId - ID del período.
   * @param {Date} registroDate - Fecha de referencia (usualmente Registro_Entrada).
   * @param {number} diffHours - Diferencia de horas a agregar (puede ser negativo).
   * @param {object} t - La transacción actual.
   * @param {number} resumenGeneralId - ID del resumen general del estudiante.
   */
  static async updateWeeklySummary(periodoId, registroDate, diffHours, t, resumenGeneralId) {
    // Convertir la fecha de registro a un rango que abarque el día completo
    const regStart = new Date(registroDate);
    regStart.setHours(0, 0, 0, 0);
    const regEnd = new Date(registroDate);
    regEnd.setHours(23, 59, 59, 999);
  
    // Buscar el seguimiento semanal cuyo rango incluya el día completo de la fecha del registro.
    const seguimiento = await Seguimiento_Semanal.findOne({
      where: {
        Periodo_ID: periodoId,
        Semana_IsDeleted: false,
        // Se comprueba que el inicio de la semana sea menor o igual al final del día
        // y el fin de la semana sea mayor o igual al inicio del día.
        Semana_Ini: { [Op.lte]: regEnd },
        Semana_Fin: { [Op.gte]: regStart }
      },
      transaction: t
    });
  
    if (!seguimiento) {
      throw new Error("El registro de asistencia se encuentra fuera de un rango semanal definido. Revise las fechas del período.");
    }
  
    // Buscar si ya existe un resumen semanal para este resumen general y esta semana (por semana_numero).
    const resumenSemanal = await Resumen_Horas_Semanales.findOne({
      where: {
        ResumenGeneral_ID: resumenGeneralId,
        Semana_Numero: seguimiento.Semana_Numero,
        ResumenSem_IsDeleted: false
      },
      transaction: t
    });
  
    if (resumenSemanal) {
      // Actualizamos sumando (o restando) la diferencia
      const newTotal = parseFloat(resumenSemanal.Horas_Asistencia) + diffHours;
      if (newTotal < 0) {
        throw new Error("El ajuste semanal daría un total negativo de horas.");
      }
      await Resumen_Horas_Semanales.update(
        { Horas_Asistencia: newTotal },
        { where: { ResumenSem_ID: resumenSemanal.ResumenSem_ID }, transaction: t }
      );
    } else {
      await Resumen_Horas_Semanales.create({
        ResumenGeneral_ID: resumenGeneralId,
        Semana_Numero: seguimiento.Semana_Numero,
        Semana_Inicio: seguimiento.Semana_Ini,
        Semana_Fin: seguimiento.Semana_Fin,
        Horas_Asistencia: diffHours,
        ResumenSem_IsDeleted: false
      }, { transaction: t });
    }
  }
  

  // --- Método: createAsistenciaWithResumen ---
  static async createAsistenciaWithResumen(data) {
    const t = await sequelize.transaction();
    try {
      // 1. Crear el nuevo registro de asistencia en la transacción
      const nuevoRegistro = await Registro_Asistencia.create(data, { transaction: t });
      
      // 2. Validar que tanto la hora de entrada como de salida estén presentes
      if (!nuevoRegistro.Registro_Entrada || !nuevoRegistro.Registro_Salida) {
        throw new Error("Se deben proporcionar tanto la hora de entrada como la de salida.");
      }
      
      // 3. Calcular la diferencia de horas (en decimales)
      const entrada = new Date(nuevoRegistro.Registro_Entrada);
      const salida = new Date(nuevoRegistro.Registro_Salida);
      const diffMs = salida.getTime() - entrada.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      // 4. Obtener el Internal_ID del estudiante usando la FK UsuarioXPeriodo_ID
      const usuarioXPeriodoId = nuevoRegistro.UsuarioXPeriodo_ID;
      if (!usuarioXPeriodoId) throw new Error("No se encontró la FK UsuarioXPeriodo_ID en el registro.");
      
      const usuarioXPeriodoRecord = await UsuarioXPeriodoModel.getByUsuarioXPeriodoId(usuarioXPeriodoId);
      if (!usuarioXPeriodoRecord || !usuarioXPeriodoRecord.usuario || !usuarioXPeriodoRecord.usuario.Internal_ID) {
        throw new Error("No se pudo determinar el identificador del estudiante.");
      }
      const studentId = usuarioXPeriodoRecord.usuario.Internal_ID;
      const periodoId = usuarioXPeriodoRecord.periodo ? usuarioXPeriodoRecord.periodo.Periodo_ID : null;
      if (!periodoId) {
        throw new Error("No se pudo determinar el período del estudiante.");
      }
      
      // 5. Actualizar o crear el resumen general de horas para ese estudiante
      let resumenGeneral = await Resumen_Horas_EstudiantesModel.getResumen_Horas_EstudiantesByUser(studentId);
      if (resumenGeneral) {
        const nuevoTotal = parseFloat(resumenGeneral.Resumen_Horas_Totales) + diffHours;
        await Resumen_Horas_EstudiantesModel.update(resumenGeneral.Resumen_ID, { Resumen_Horas_Totales: nuevoTotal }, { transaction: t });
        // Actualizamos el objeto local
        resumenGeneral.Resumen_Horas_Totales = nuevoTotal;
      } else {
        resumenGeneral = await Resumen_Horas_EstudiantesModel.create({
          Internal_ID: studentId,
          Resumen_Inicio: entrada,
          Resumen_Horas_Totales: diffHours
        }, { transaction: t });
      }
      
      // 6. Actualizar o crear el resumen semanal
      await this.updateWeeklySummary(periodoId, entrada, diffHours, t, resumenGeneral.Resumen_ID);
      
      await t.commit();
      return nuevoRegistro; // Retornar el registro creado
    } catch (error) {
      await t.rollback();
      console.error("Error en la transacción createAsistenciaWithResumen:", error);
      throw new Error(`Error al crear registro de asistencia y resumen: ${error.message}`);
    }
  }
      
 
     //Actualizar un registro solo si no está eliminado
     static async update(id, data) {
         try {
             const registro = await this.getById(id);
 
             if (!registro) return null;
 
             const [rowsUpdated] = await Registro_Asistencia.update(data, {
                 where: { Registro_ID: id, Registro_IsDeleted: false }
             });
 
             if (rowsUpdated === 0) return null;
             return await this.getById(id);
         } catch (error) {
             throw new Error(`Error al actualizar registro de asistencia: ${error.message}`);
         }
     }
 
     //Eliminar (marcar como eliminado) solo si no está eliminado
     static async delete(id) {
         try {
             const registro = await this.getById(id);
 
             if (!registro) return null;
 
             const data = { Registro_IsDeleted: true };
             const [rowsUpdated] = await Registro_Asistencia.update(data, {
                 where: { Registro_ID: id, Registro_IsDeleted: false }
             });
 
             if (rowsUpdated === 0) return null;
             return true;
         } catch (error) {
             throw new Error(`Error al eliminar registro de asistencia: ${error.message}`);
         }
     }




       /**
   * Actualiza un registro de asistencia con la hora de salida y actualiza (o crea) el resumen de horas del estudiante.
   * Se usa una transacción para que ambas operaciones se ejecuten juntas.
   *
   * @param {number} registroId - El ID del registro de asistencia a actualizar.
   * @param {Object} data - Objeto con la nueva información, al menos debe incluir { Registro_Salida }.
   * @returns {Promise<Object>} El registro de asistencia actualizado.
   */
   /**
   * Actualiza un registro de asistencia con la hora de salida y actualiza (o crea) el resumen de horas del estudiante.
   * Se usa una transacción para que ambas operaciones se ejecuten juntas.
   *
   * @param {number} registroId - El ID del registro de asistencia a actualizar.
   * @param {Object} data - Objeto con la nueva información, al menos { Registro_Salida }.
   * @returns {Promise<Object>} El registro de asistencia actualizado.
   */


   // --- Método: updateSalidaWithResumen ---
  static async updateSalidaWithResumen(registroId, data) {
    const t = await sequelize.transaction();
    try {
      // 1. Obtener el registro actual con bloqueo
      const registro = await Registro_Asistencia.findOne({
        where: { Registro_ID: registroId, Registro_IsDeleted: false },
        transaction: t,
        lock: t.LOCK.UPDATE
      });
      if (!registro) throw new Error("Registro de asistencia no encontrado");
      if (!registro.Registro_Entrada)
        throw new Error("No existe hora de entrada registrada para este registro");

      // 2. Actualizar el registro con la hora de salida
      await Registro_Asistencia.update(data, {
        where: { Registro_ID: registroId, Registro_IsDeleted: false },
        transaction: t
      });

      // 3. Calcular la diferencia de horas (en decimales)
      const entrada = new Date(registro.Registro_Entrada);
      const salida = new Date(data.Registro_Salida);
      const diffMs = salida.getTime() - entrada.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // 4. Obtener el Internal_ID y el período del estudiante
      const usuarioXPeriodoId = registro.UsuarioXPeriodo_ID;
      if (!usuarioXPeriodoId) throw new Error("No se encontró la FK UsuarioXPeriodo_ID en el registro");
      const usuarioXPeriodoRecord = await UsuarioXPeriodoModel.getByUsuarioXPeriodoId(usuarioXPeriodoId);
      if (!usuarioXPeriodoRecord || !usuarioXPeriodoRecord.usuario || !usuarioXPeriodoRecord.usuario.Internal_ID) {
        throw new Error("No se pudo determinar el identificador del estudiante");
      }
      const studentId = usuarioXPeriodoRecord.usuario.Internal_ID;
      const periodoId = usuarioXPeriodoRecord.periodo ? usuarioXPeriodoRecord.periodo.Periodo_ID : null;
      if (!periodoId) {
        throw new Error("No se pudo determinar el período del estudiante.");
      }

    // 5. Actualizar o crear el resumen general de horas para ese estudiante
let resumenGeneral = await Resumen_Horas_EstudiantesModel.getResumen_Horas_EstudiantesByUser(studentId);
if (resumenGeneral) {
  const nuevoTotal = parseFloat(resumenGeneral.Resumen_Horas_Totales) + diffHours;
  await Resumen_Horas_EstudiantesModel.update(resumenGeneral.Resumen_ID, {
    Resumen_Horas_Totales: nuevoTotal
  }, { transaction: t });
  resumenGeneral.Resumen_Horas_Totales = nuevoTotal;
} else {
  resumenGeneral = await Resumen_Horas_EstudiantesModel.create({
    Internal_ID: studentId,
    Resumen_Inicio: entrada,
    Resumen_Horas_Totales: diffHours
  }, { transaction: t });
}

// ✅ Aseguramos que el ID del resumen exista antes de llamar a updateWeeklySummary
await this.updateWeeklySummary(periodoId, entrada, diffHours, t, resumenGeneral.Resumen_ID);


      await t.commit();
      return await this.getById(registroId);
    } catch (error) {
      await t.rollback();
      console.error("Error en la transacción updateSalidaWithResumen:", error);
      throw new Error(`Error al actualizar registro de asistencia y resumen: ${error.message}`);
    }
}




 
        // Nuevo método: Obtener el registro abierto para un usuario x período
    // Si se pasa la fecha, se filtra entre el inicio y fin del día
static async getRegistroAbierto(usuarioXPeriodoId, fecha, modalidad) {
    try {
      // Se asume que 'fecha' es una cadena "YYYY-MM-DD" en UTC
      const start = new Date(fecha);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(fecha);
      end.setUTCHours(23, 59, 59, 999);
  
      const whereClause = {
        UsuarioXPeriodo_ID: usuarioXPeriodoId,
        Registro_IsDeleted: false,
        Registro_Salida: null,
        Registro_Entrada: { [Op.between]: [start, end] }
      };
      
      // Si se ha recibido modalidad (no vacía) se añade al filtro
      if (modalidad && modalidad.trim() !== "") {
        whereClause.Registro_Tipo = modalidad;
      }
  
      console.log("Where:", whereClause);
  
      return await Registro_Asistencia.findOne({ where: whereClause });
    } catch (error) {
      console.log("Error:", error);
      throw new Error(`Error al obtener registro abierto: ${error.message}`);
    }
  }

  // Nuevo método en Registro_AsistenciaModel para obtener el registro virtual completo
static async getRegistroVirtualCompleto(usuarioXPeriodoId, fecha) {
  try {
    // Se asume que 'fecha' es una cadena "YYYY-MM-DD" en UTC
    const start = new Date(fecha);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(fecha);
    end.setUTCHours(23, 59, 59, 999);

    // Definimos el filtro, forzando la modalidad a "Virtual"
    const whereClause = {
      UsuarioXPeriodo_ID: usuarioXPeriodoId,
      Registro_IsDeleted: false,
      Registro_Tipo: "Virtual", 
      Registro_Entrada: { [Op.between]: [start, end] },
      Registro_Salida: { [Op.ne]: null } // Esto garantiza que el registro esté cerrado.
    };
    

    console.log("whereClause en getRegistroVirtualCompleto:", whereClause);

    // Se asume que solo puede existir como máximo un registro virtual abierto por día,
    // por lo que se utiliza findOne.
    return await Registro_Asistencia.findOne({ where: whereClause });
  } catch (error) {
    console.error("Error en getRegistroVirtualCompleto:", error);
    throw new Error(`Error al obtener registro virtual completo: ${error.message}`);
  }
}


      static async getRegistrosAbiertosConUsuario() {
        try {
          return await Registro_Asistencia.findAll({
            where: {
              Registro_IsDeleted: false,
              Registro_Salida: null
            },
            include: [
              {
                model: UsuarioXPeriodo, // Asegúrate de importar este modelo (no el wrapper)
                as: 'usuarioXPeriodo',
                attributes: ['UsuarioXPeriodo_ID'], // Puedes incluir otros atributos de la relación si los necesitas
                where: {
                  UsuarioXPeriodo_IsDeleted: false // Asegúrate de que el usuario no esté eliminado
                },
                include: [
                  {
                    model: InternalUser, // Asegúrate de importar InternalUser
                    as: 'usuario',
                    attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"],
                    where: {
                      Internal_Status: 'Activo' // Asegúrate de que el usuario no esté eliminado
                    }
                  }
                ]
              }
            ]
          });
        } catch (error) {
          throw new Error(`Error al obtener registros abiertos: ${error.message}`);
        }
      }

     // --- Método: deleteConAjuste ---
  // Método: deleteConAjuste
// Método: deleteConAjuste
static async deleteConAjuste(registroId) {
  const t = await sequelize.transaction();
  try {
    // 1. Obtener el registro cerrado (con bloqueo para evitar condiciones de carrera)
    const registro = await Registro_Asistencia.findOne({
      where: { Registro_ID: registroId, Registro_IsDeleted: false },
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    if (!registro) throw new Error("Registro de asistencia no encontrado");
    if (!registro.Registro_Entrada || !registro.Registro_Salida) {
      throw new Error("El registro no está cerrado; no se puede eliminar con ajuste");
    }

    // 2. Calcular la diferencia de horas (en decimales)
    const entrada = new Date(registro.Registro_Entrada);
    const salida = new Date(registro.Registro_Salida);
    const diffMs = salida.getTime() - entrada.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // 3. Marcar el registro como eliminado
    const [rowsUpdated] = await Registro_Asistencia.update(
      { Registro_IsDeleted: true },
      { where: { Registro_ID: registroId, Registro_IsDeleted: false }, transaction: t }
    );
    if (rowsUpdated === 0) throw new Error("No se pudo marcar el registro como eliminado");

    // 4. Obtener el usuario y resumen general
    const usuarioXPeriodoId = registro.UsuarioXPeriodo_ID;
    if (!usuarioXPeriodoId) throw new Error("No se encontró la FK UsuarioXPeriodo_ID en el registro");
    const usuarioXPeriodoRecord = await UsuarioXPeriodoModel.getByUsuarioXPeriodoId(usuarioXPeriodoId);
    if (!usuarioXPeriodoRecord || !usuarioXPeriodoRecord.usuario || !usuarioXPeriodoRecord.usuario.Internal_ID) {
      throw new Error("No se pudo determinar el identificador del estudiante");
    }
    const studentId = usuarioXPeriodoRecord.usuario.Internal_ID;
    const resumenExistente = await Resumen_Horas_EstudiantesModel.getResumen_Horas_EstudiantesByUser(studentId);
    if (!resumenExistente) {
      throw new Error("No se encontró resumen general para el estudiante");
    }

    // 5. Ajustar el resumen general
    const nuevoTotal = parseFloat(resumenExistente.Resumen_Horas_Totales) - diffHours;
    const totalFinal = Math.max(nuevoTotal, 0);
    await Resumen_Horas_EstudiantesModel.update(
      resumenExistente.Resumen_ID,
      { Resumen_Horas_Totales: totalFinal },
      { transaction: t }
    );

    // 6. Actualizar el resumen semanal (restar diffHours)
    const periodoIdValue = usuarioXPeriodoRecord.periodo ? usuarioXPeriodoRecord.periodo.Periodo_ID : null;
    if (!periodoIdValue) {
      throw new Error("No se pudo determinar el período del estudiante.");
    }
    await this.updateWeeklySummary(periodoIdValue, entrada, -diffHours, t, resumenExistente.Resumen_ID);

    await t.commit();
    return true;
  } catch (error) {
    await t.rollback();
    console.error("Error en deleteConAjuste:", error);
    throw new Error(`Error al eliminar registro con ajuste: ${error.message}`);
  }
}

      

      /**
   * Obtiene todos los registros cerrados (con entrada y salida) que no estén eliminados.
   * @returns {Promise<Array>} Arreglo de registros cerrados.
   */
      static async getRegistrosCerrados() {
        try {
          return await Registro_Asistencia.findAll({
            where: {
              Registro_IsDeleted: false,
              Registro_Entrada: { [Op.ne]: null },
              Registro_Salida: { [Op.ne]: null }
            },
            include: [
              {
                model: UsuarioXPeriodo,
                as: 'usuarioXPeriodo',
                attributes: ['UsuarioXPeriodo_ID', 'Periodo_ID'],
                where: { UsuarioXPeriodo_IsDeleted: false },
                include: [
                  {
                    model: InternalUser,
                    as: 'usuario',
                    attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"],
                    where: { Internal_Status: 'Activo' }
                  },
                  {
                    model: Periodo,
                    as: 'periodo',
                    attributes: ["Periodo_ID","PeriodoNombre"],
                    where: { Periodo_IsDeleted: false }
                  }
                ]
              }
            ]
          });
        } catch (error) {
          throw new Error(`Error al obtener registros cerrados: ${error.message}`);
        }
      }
      

  /**
   * Actualiza un registro cerrado (que ya tiene hora de entrada y salida) y recalcula el resumen general del estudiante.
   * Se usa una transacción para que ambas operaciones se realicen de forma atómica.
   *
   * @param {number} registroId - El ID del registro de asistencia a actualizar.
   * @param {Object} newData - Objeto con la nueva información, por lo menos { Registro_Entrada, Registro_Salida }.
   * @returns {Promise<Object>} El registro de asistencia actualizado.
   */
  // --- Método: updateCerradoConResumen ---
 // Método: updateCerradoConResumen
// Método: updateCerradoConResumen
static async updateCerradoConResumen(registroId, newData) {
  const t = await sequelize.transaction();
  try {
    // 1. Obtener el registro actual con bloqueo
    const registro = await Registro_Asistencia.findOne({
      where: { Registro_ID: registroId, Registro_IsDeleted: false },
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    if (!registro) throw new Error("Registro de asistencia no encontrado");
    if (!registro.Registro_Entrada || !registro.Registro_Salida)
      throw new Error("El registro no está cerrado, no se puede actualizar con este método");

    // 2. Calcular la diferencia antigua de horas (en decimales)
    const oldEntrada = new Date(registro.Registro_Entrada);
    const oldSalida = new Date(registro.Registro_Salida);
    const oldDiffMs = oldSalida.getTime() - oldEntrada.getTime();
    const oldDiffHours = oldDiffMs / (1000 * 60 * 60);

    // 3. Actualizar el registro con los nuevos datos
    await Registro_Asistencia.update(newData, {
      where: { Registro_ID: registroId, Registro_IsDeleted: false },
      transaction: t
    });
    const updatedRegistro = await Registro_Asistencia.findOne({
      where: { Registro_ID: registroId, Registro_IsDeleted: false },
      transaction: t
    });
    if (!updatedRegistro.Registro_Entrada || !updatedRegistro.Registro_Salida)
      throw new Error("El registro actualizado no está completo");

    // 4. Calcular la nueva diferencia de horas
    const newEntrada = new Date(updatedRegistro.Registro_Entrada);
    const newSalida = new Date(updatedRegistro.Registro_Salida);
    const newDiffMs = newSalida.getTime() - newEntrada.getTime();
    const newDiffHours = newDiffMs / (1000 * 60 * 60);
    const diffForWeekly = newDiffHours - oldDiffHours;

    // 5. Ajustar el resumen general
    const usuarioXPeriodoId = updatedRegistro.UsuarioXPeriodo_ID;
    if (!usuarioXPeriodoId) throw new Error("No se encontró la FK UsuarioXPeriodo_ID en el registro");
    const usuarioXPeriodoRecord = await UsuarioXPeriodoModel.getByUsuarioXPeriodoId(usuarioXPeriodoId);
    if (!usuarioXPeriodoRecord || !usuarioXPeriodoRecord.usuario || !usuarioXPeriodoRecord.usuario.Internal_ID) {
      throw new Error("No se pudo determinar el identificador del estudiante");
    }
    const studentId = usuarioXPeriodoRecord.usuario.Internal_ID;
    const resumenExistente = await Resumen_Horas_EstudiantesModel.getResumen_Horas_EstudiantesByUser(studentId);
    if (!resumenExistente) {
      throw new Error("No se encontró resumen general para el estudiante");
    }
    const nuevoTotal = parseFloat(resumenExistente.Resumen_Horas_Totales) - oldDiffHours + newDiffHours;
    if (nuevoTotal < 0) {
      throw new Error("El ajuste daría un total negativo de horas");
    }
    await Resumen_Horas_EstudiantesModel.update(
      resumenExistente.Resumen_ID,
      { Resumen_Horas_Totales: nuevoTotal },
      { transaction: t }
    );

    // 6. Actualizar el resumen semanal con la diferencia (newDiffHours - oldDiffHours)
    const diffForWeeklyValue = newDiffHours - oldDiffHours;
    const periodoIdValue = usuarioXPeriodoRecord.periodo ? usuarioXPeriodoRecord.periodo.Periodo_ID : null;
    if (!periodoIdValue) {
      throw new Error("No se pudo determinar el período del estudiante.");
    }
    await this.updateWeeklySummary(periodoIdValue, newEntrada, diffForWeeklyValue, t, resumenExistente.Resumen_ID);

    await t.commit();
    return updatedRegistro;
  } catch (error) {
    await t.rollback();
    console.error("Error en updateCerradoConResumen:", error);
    throw new Error(`Error al actualizar registro cerrado y resumen: ${error.message}`);
  }
}


      
 }