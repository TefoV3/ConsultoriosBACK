import { Seguimiento_SemanalModel } from "../../models/schedule_models/Seguimiento_Semanal.js";

export class Seguimiento_SemanalController {
    static async getSeguimientos(req, res) {
        try {
            const seguimientos = await Seguimiento_SemanalModel.getSeguimientos();
            res.status(200).json(seguimientos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const seguimiento = await Seguimiento_SemanalModel.getById(id);

            if (seguimiento) {
                res.status(200).json(seguimiento);
            } else {
                res.status(404).json({ error: "Seguimiento no encontrado" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getLastSeguimientoByPeriodo(req, res) {
        try {
            const periodoId = parseInt(req.params.periodoId);
            const seguimiento = await Seguimiento_SemanalModel.getLastSeguimientoByPeriodo(periodoId);

            if (seguimiento) {
                res.status(200).json(seguimiento);
            } else {
                res.status(404).json({ error: "Seguimiento no encontrado" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const seguimiento = req.body;
            const newSeguimiento = await Seguimiento_SemanalModel.create(seguimiento);
            res.status(201).json(newSeguimiento);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    //bulk create
    static async createBulk(req, res) {
        try {
            const seguimientos = req.body;
            const newSeguimientos = await Seguimiento_SemanalModel.createBulk(seguimientos);
            res.status(201).json(newSeguimientos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            const seguimiento = req.body;
            const updatedSeguimiento = await Seguimiento_SemanalModel.update(id, seguimiento);

            if (updatedSeguimiento) {
                res.status(200).json(updatedSeguimiento);
            } else {
                res.status(404).json({ error: "Seguimiento no encontrado" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            const seguimiento = await Seguimiento_SemanalModel.delete(id);

            if (seguimiento) {
                res.status(200).json(seguimiento);
            } else {
                res.status(404).json({ error: "Seguimiento no encontrado" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async recalcularSemanas(req, res) {
        try {
          const periodoId = parseInt(req.params.periodoId);
          const { nuevaFechaInicio, fechaFin } = req.body;
          // Se asume que 'nuevaFechaInicio' y 'fechaFin' vienen en formato ISO
          const resultado = await Seguimiento_SemanalModel.recalcularSemanas(
            periodoId,
            new Date(nuevaFechaInicio),
            new Date(fechaFin)
          );
          res.status(200).json(resultado);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      }
}