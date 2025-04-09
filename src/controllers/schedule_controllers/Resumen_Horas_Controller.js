import { Resumen_Horas_EstudiantesModel } from "../../models/schedule_models/Resumen_Horas_Estudiantes.js";

export class resumenHorasController {
    static async getResumen_Horas_Estudiantes(req, res) {
        try {
            const resumenHorasEstudiantes = await Resumen_Horas_EstudiantesModel.getResumen_Horas_Estudiantes();
            res.json(resumenHorasEstudiantes);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const resumenHorasEstudiantes = await Resumen_Horas_EstudiantesModel.getById(id);
            if (resumenHorasEstudiantes) return res.json(resumenHorasEstudiantes)
            res.status(404).json({ message: "Resumen de horas no encontrado" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    // Crear un nuevo resumen de horas
    static async createResumen_Horas_Estudiantes(req, res) {
        try {
            const newResumenHoras = await Resumen_Horas_EstudiantesModel.create(req.body);
            return res.status(201).json(newResumenHoras);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedResumenHoras = await Resumen_Horas_EstudiantesModel.update(id, req.body);

            if (!updatedResumenHoras) return res.status(404).json({ message: "Resumen de horas no encontrado" });

            return res.json(updatedResumenHoras);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async getAllResumen_Horas_Estudiantes(req, res) {
        try {
            const resumenHorasEstudiantes = await Resumen_Horas_EstudiantesModel.getAllResumenesConEstudiantes();
            res.json(resumenHorasEstudiantes);
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedResumenHoras = await Resumen_Horas_EstudiantesModel.delete(id);

            if (!deletedResumenHoras) return res.status(404).json({ message: "Resumen de horas no encontrado" });
            return res.json({ message: "Resumen de horas eliminado lógicamente", resumenHoras: deletedResumenHoras });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async getResumen_Horas_EstudiantesByUser(req, res) {
        try {
            const resumenHorasEstudiantes = await Resumen_Horas_EstudiantesModel.getResumen_Horas_EstudiantesByUser(req.params.id);
            res.json(resumenHorasEstudiantes);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getResumenConDatosByUser(req, res) {
        const { id } = req.params; // id se refiere al Internal_ID del estudiante
        try {
            const resumen = await Resumen_Horas_EstudiantesModel.getResumenConDatosByUser(id);
            if (!resumen) {
                return res.status(404).json({ message: "Resumen de horas no encontrado para el usuario" });
            }
            return res.status(200).json(resumen);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

}