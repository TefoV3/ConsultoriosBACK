import { Parametro_HorarioModel } from "../../models/schedule_models/Parametro_Horario.js";

export class Parametro_HorarioController {
    static async getParametro_Horarios(req, res) {
        try {
            const parametroHorarios = await Parametro_HorarioModel.getParametro_Horarios();
            res.json(parametroHorarios);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { parametroHorarioId } = req.params;
        try {
            const parametroHorario = await Parametro_HorarioModel.getById(parametroHorarioId);
            if (parametroHorario) return res.json(parametroHorario)
            res.status(404).json({ message: "Parametro_Horario no encontrado" });
        } catch (error) {
            res.status(500).json(error);
        }
    }
    
    static async getHorariosDisponiblesPorTipo(req, res) {
        const { tipo, periodoId, area, dia} = req.params;
        try {
            const horariosDisponibles = await Parametro_HorarioModel.getHorariosDisponiblesPorTipo(tipo, periodoId, area,dia);
            res.json(Array.isArray(horariosDisponibles) ? horariosDisponibles : [horariosDisponibles]);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async create(req, res) {
        try {
            const newParametro_Horario = await Parametro_HorarioModel.create(req.body);
            return res.status(201).json(newParametro_Horario);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { parametroHorarioId } = req.params;
            const updatedParametro_Horario = await Parametro_HorarioModel.update(parametroHorarioId, req.body);

            if (!updatedParametro_Horario) return res.status(404).json({ message: "Parametro_Horario no encontrado" });

            return res.json(updatedParametro_Horario);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        const { parametroHorarioId } = req.params;
        try {
            const deletedParametro_Horario = await Parametro_HorarioModel.delete(parametroHorarioId);
            if (deletedParametro_Horario) return res.json({ message: "Parametro_Horario eliminado" });
            res.status(404).json({ message: "Parametro_Horario no encontrado" });
        } catch (error) {
            res.status(500).json(error);
        }
    }
}