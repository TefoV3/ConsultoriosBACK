import { Resumen_Horas_SemanalesModel } from "../../models/schedule_models/Resumen_Horas_Semanales.js";

export class Resumen_Horas_Semanales_Controller {
  // Obtener todos los resúmenes semanales activos
  static async getResumenSemanales(req, res) {
    try {
      const resumenSemanales = await Resumen_Horas_SemanalesModel.getResumen_Horas_Semanales();
      res.status(200).json(resumenSemanales);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

    // Nuevo método para obtener resúmenes semanales por el id del resumen general
    static async getResumenesByResumenGeneral(req, res) {
      try {
        // Se espera que el id del resumen general se pase como parámetro de ruta
        const { resumenGeneralId } = req.params;
        const resumenes = await Resumen_Horas_SemanalesModel.getResumenesByResumenGeneral(resumenGeneralId);
        if (!resumenes || resumenes.length === 0) {
          res.status(404).json({ message: "No se encontraron resúmenes semanales para el resumen general indicado." });
        } else {
          res.status(200).json(resumenes);
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }

  // Obtener un resumen semanal por su ID
  static async getById(req, res) {
    const { id } = req.params;
    try {
      const resumenSemanal = await Resumen_Horas_SemanalesModel.getResumen_Horas_SemanalesById(id);
      if (resumenSemanal) {
        res.status(200).json(resumenSemanal);
      } else {
        res.status(404).json({ message: "Resumen semanal no encontrado" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Crear un nuevo resumen semanal
  static async create(req, res) {
    try {
      const data = req.body;
      const newResumenSemanal = await Resumen_Horas_SemanalesModel.create(data);
      res.status(201).json(newResumenSemanal);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Actualizar un resumen semanal y retornar el registro actualizado
  static async update(req, res) {
    const { id } = req.params;
    try {
      const data = req.body;
      const updatedResumenSemanal = await Resumen_Horas_SemanalesModel.update(id, data);
      if (updatedResumenSemanal) {
        res.status(200).json(updatedResumenSemanal);
      } else {
        res.status(404).json({ message: "Resumen semanal no encontrado" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Eliminar lógicamente un resumen semanal
  static async delete(req, res) {
    const { id } = req.params;
    try {
      const deleted = await Resumen_Horas_SemanalesModel.delete(id);
      if (deleted) {
        res.status(200).json({ message: "Resumen semanal eliminado correctamente" });
      } else {
        res.status(404).json({ message: "Resumen semanal no encontrado" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
