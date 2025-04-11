import { Horas_Extraordinarias } from "../../schemas/schedules_tables/Horas_Extraordinarias_schema.js";
import { Resumen_Horas_EstudiantesModel } from "./Resumen_Horas_Estudiantes.js";
import { sequelize } from "../../database/database.js";

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

    /**
   * Crea un ajuste de horas extraordinarias y actualiza (o crea) el resumen de horas del estudiante.
   * Se utiliza una transacción para asegurar que ambas operaciones se realicen de forma atómica.
   *
   * @param {Object} data - Objeto que contiene:
   *   - Internal_ID: string (identificador del estudiante)
   *   - Horas_Num: number (valor del ajuste, siempre positivo)
   *   - Horas_Tipo: string ("adicional" o "reducida")
   *   - Horas_Fecha: date (fecha del ajuste)
   *   - Horas_Comentario: string (opcional)
   * @returns {Promise<Object>} El registro de Horas Extraordinarias creado.
   */
  static async createWithResumen(data) {
    console.log("Data para crear ajuste:", data);
    const t = await sequelize.transaction();
    try {
      // 1. Crear el ajuste en Horas_Extraordinarias
      const ajuste = await Horas_Extraordinarias.create(data, { transaction: t });
      console.log("Ajuste creado:", ajuste);
      // 2. Definir el valor a sumar o restar según el tipo
      let adicional = 0, reducidas = 0;
      if (data.Horas_Tipo && data.Horas_Tipo.toLowerCase() === "adicional") {
        adicional = parseFloat(data.Horas_Num);
      } else if (data.Horas_Tipo && data.Horas_Tipo.toLowerCase() === "reducida") {
        reducidas = parseFloat(data.Horas_Num);
      }
      
      // 3. Consultar si ya existe un resumen para el estudiante
      const resumenExistente = await Resumen_Horas_EstudiantesModel.getResumen_Horas_EstudiantesByUser(data.Internal_ID);
      console.log("Resumen existente:", resumenExistente);
      
      if (resumenExistente) {
        // Calcular los nuevos totales
        const nuevoAdicional = parseFloat(resumenExistente.Resumen_Horas_Adicionales) + adicional;
        const nuevoReducidas = parseFloat(resumenExistente.Resumen_Horas_Reducidas) + reducidas;
        const nuevoTotal = parseFloat(resumenExistente.Resumen_Horas_Totales) + adicional - reducidas;
      
        if (nuevoTotal < 0) {
          throw new Error("No se pueden reducir más horas de las que el estudiante tiene acumuladas.");
        }
      
        await Resumen_Horas_EstudiantesModel.update(resumenExistente.Resumen_ID, {
          Resumen_Horas_Adicionales: nuevoAdicional,
          Resumen_Horas_Reducidas: nuevoReducidas,
          Resumen_Horas_Totales: nuevoTotal
        }, { transaction: t });
      } else {
        // En caso de creación, si el ajuste es de tipo 'reducida', se debe asegurar que no se cree un total negativo.
        const totalInicial = adicional - reducidas;
        if (totalInicial < 0) {
          throw new Error("No se pueden reducir más horas de las que el estudiante tiene acumuladas.");
        }
        await Resumen_Horas_EstudiantesModel.create({
          Internal_ID: data.Internal_ID,
          Resumen_Inicio: data.Horas_Fecha,
          Resumen_Horas_Adicionales: adicional,
          Resumen_Horas_Reducidas: reducidas,
          Resumen_Horas_Totales: totalInicial,
          Resumen_IsDeleted: false
        }, { transaction: t });
      }
      
      await t.commit();
      return ajuste;
    } catch (error) {
      await t.rollback();
      console.log("Error en la transacción:", error);
      console.error("Error en createWithResumen:", error);
      throw new Error(`Error al crear ajuste y actualizar resumen: ${error.message}`);
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
