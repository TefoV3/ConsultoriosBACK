import { HorarioModel } from "../../models/schedule_models/Horario.js";

export class HorarioController {
    static async getHorarios(req, res) {
        try {
            const horarios = await HorarioModel.getHorarios();
            res.json(horarios);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const horario = await HorarioModel.getById(id);
            if (horario) return res.json(horario)
            res.status(404).json({ message: "Horario no encontrado" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getDisponibilidadHorario(req, res) {
        try {
            const { periodoId, area, dia } = req.params;
            const areaDecoded = decodeURIComponent(area);
            const disponibilidad = await HorarioModel.getDisponibilidadHorario(periodoId, areaDecoded, dia);
            res.json(disponibilidad);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getHorarioByUsuarioXPeriodo(req, res) {
        try {
            const { usuarioXPeriodoId } = req.params;
            const horario = await HorarioModel.getHorarioByUsuarioXPeriodo(usuarioXPeriodoId);

            if (!horario) {
                return res.status(404).json({ message: "No hay horario asignado" });
            }

            res.json(horario);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
            
    static async getHorariosCompletos(req, res) {
        const { periodoId, area } = req.query;
        if (!periodoId || !area) {
          return res.status(400).json({ mensaje: "Faltan parámetros: periodoId y area son requeridos" });
        }
        try {
          const horarios = await HorarioModel.getHorariosCompletos(periodoId, area);
          return res.status(200).json(horarios);
        } catch (error) {
          console.error("❌ Error en getHorariosCompletos:", error.message);
          return res.status(500).json({ mensaje: "Error al obtener los horarios completos" });
        }
      }


    static async cambioAdministrativo(req, res) {
        try {
            const { usuarioXPeriodoId, nuevoHorario } = req.body;

            if (!usuarioXPeriodoId || !nuevoHorario) {
                return res.status(400).json({ mensaje: 'Datos incompletos para cambio administrativo' });
            }

            const resultado = await HorarioModel.cambioAdministrativo(usuarioXPeriodoId, nuevoHorario);

            if (resultado.ok) {
                return res.status(200).json({ mensaje: 'Cambio administrativo realizado correctamente' });
            } else {
                return res.status(400).json({ mensaje: resultado.mensaje });
            }
        } catch (error) {
            console.error(`❌ Error en cambio administrativo: ${error.message}`);
            return res.status(500).json({ mensaje: 'Error interno en cambio administrativo' });
        }
    }

    static async getHorarioByUsuarioXPeriodo(req, res) {
        try {
            const { usuarioXPeriodoId } = req.params;
            const horario = await HorarioModel.getHorarioByUsuarioXPeriodo(usuarioXPeriodoId);
    
            if (!horario) {
                return res.status(404).json({ mensaje: "No se encontró horario para ese estudiante en ese periodo." });
            }
    
            res.json(horario);
        } catch (error) {
            console.error(`❌ Error al obtener horario por UsuarioXPeriodo: ${error.message}`);
            res.status(500).json({ error: "Error al obtener horario." });
        }
    }
    

    // Crear un nuevo horario
    static async createHorario(req, res) {
        try {
            const newHorario = await HorarioModel.create(req.body);
            return res.status(201).json(newHorario);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedHorario = await HorarioModel.update(id, req.body);

            if (!updatedHorario) return res.status(404).json({ message: "Horario no encontrado" });

            return res.json(updatedHorario);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedHorario = await HorarioModel.delete(id);

            if (!deletedHorario) return res.status(404).json({ message: "Horario no encontrado" });
            return res.json({ message: "Horario eliminado lógicamente", horario: deletedHorario });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

  /*  static async getHorariosByUser(req, res) {
        try {
            const horarios = await HorarioModel.getHorariosByUser(req.params.id);
            res.json(horarios);
        } catch (error) {
            res.status(500).json(error);
        }
    }*/
}