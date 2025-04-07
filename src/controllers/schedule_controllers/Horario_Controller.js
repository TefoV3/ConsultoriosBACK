import { HorarioModel } from "../../models/schedule_models/Horario.js";

export class HorarioController {
  // Obtener todos los horarios activos
  static async getHorarios(req, res) {
    try {
      const horarios = await HorarioModel.getHorarios();
      res.json(horarios);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obtener un horario por ID
  static async getById(req, res) {
    const { id } = req.params;
    try {
      const horario = await HorarioModel.getById(id);
      if (horario) return res.json(horario);
      res.status(404).json({ message: "Horario no encontrado" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obtener disponibilidad para un día concreto
  static async getDisponibilidadHorario(req, res) {
    try {
      const { periodoId, area, dia } = req.params;
      const areaDecoded = decodeURIComponent(area);
      const disponibilidad = await HorarioModel.getDisponibilidadHorario(periodoId, areaDecoded, dia);
      res.json(disponibilidad);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obtener todos los horarios asignados a un usuarioXPeriodo (posiblemente más de uno)
  static async getHorariosByUsuarioXPeriodo(req, res) {
    try {
      const { usuarioXPeriodoId } = req.params;
      const horarios = await HorarioModel.getHorariosByUsuarioXPeriodo(usuarioXPeriodoId);
      if (!horarios || horarios.length === 0) {
        return res.status(404).json({ message: "No hay horarios asignados" });
      }
      res.json(horarios);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Obtener horarios completos con información unida
  static async getHorariosCompletos(req, res) {
    const { periodoId, area } = req.query;
    if (!periodoId || !area) {
      return res.status(400).json({ message: "Faltan parámetros: periodoId y area son requeridos" });
    }
    try {
      const horarios = await HorarioModel.getHorariosCompletos(periodoId, area);
      res.status(200).json(horarios);
    } catch (error) {
      console.error("❌ Error en getHorariosCompletos:", error.message);
      res.status(500).json({ message: "Error al obtener los horarios completos" });
    }
  }

  // Cambio administrativo: se eliminan lógicamente TODOS los horarios activos para el usuario y se crean nuevos
  static async cambioAdministrativo(req, res) {
    try {
      const { usuarioXPeriodoId, nuevosHorarios } = req.body;

      if (!usuarioXPeriodoId || !nuevosHorarios || !Array.isArray(nuevosHorarios) || nuevosHorarios.length === 0) {
        return res.status(400).json({ message: 'Datos incompletos para cambio administrativo' });
      }

      const resultado = await HorarioModel.cambioAdministrativo(usuarioXPeriodoId, nuevosHorarios);

      if (resultado.ok) {
        return res.status(200).json({ message: 'Cambio administrativo realizado correctamente' });
      } else {
        return res.status(400).json({ message: resultado.mensaje });
      }
    } catch (error) {
      console.error(`❌ Error en cambio administrativo: ${error.message}`);
      res.status(500).json({ message: 'Error interno en cambio administrativo' });
    }
  }

  // Actualizar un único horario (modificar solo el que cambió)
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updatedHorario = await HorarioModel.update(id, req.body);
      if (!updatedHorario) return res.status(404).json({ message: "Horario no encontrado" });
      res.json(updatedHorario);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Eliminar (marcar como eliminado) un horario
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedHorario = await HorarioModel.delete(id);
      if (!deletedHorario) return res.status(404).json({ message: "Horario no encontrado" });
      res.json({ message: "Horario eliminado lógicamente", horario: deletedHorario });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Crear un nuevo horario
  static async createHorario(req, res) {
    try {
      const newHorario = await HorarioModel.create(req.body);
      res.status(201).json(newHorario);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
