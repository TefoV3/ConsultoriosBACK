import { PeriodoModel } from "../../models/schedule_models/Periodo.js";

export class PeriodoController {
    static async getPeriodos(req, res) {
        try {
            const periodos = await PeriodoModel.getPeriodos();
            res.json(periodos);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const periodo = await PeriodoModel.getById(id);
            if (periodo) return res.json(periodo)
            res.status(404).json({ message: "Periodo no encontrado" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    
static async getPeriodoConSeguimientos (req, res) {
    const { id } = req.params;  // Se espera que el ID del período se pase en la URL
    try {
      const periodo = await PeriodoModel.getPeriodoConSeguimientos(id);
      if (!periodo) {
        return res.status(404).json({ message: "Período no encontrado" });
      }
      res.json(periodo);
    } catch (error) {
      res.status(500).json({ message: `Error al obtener el período: ${error.message}` });
    }
  };

    // Crear un nuevo periodo
    static async createPeriodo(req, res) {
        try {
            const newPeriodo = await PeriodoModel.create(req.body);
            return res.status(201).json(newPeriodo);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedPeriodo = await PeriodoModel.update(id, req.body);

            if (!updatedPeriodo) return res.status(404).json({ message: "Periodo no encontrado" });

            return res.json(updatedPeriodo);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedPeriodo = await PeriodoModel.delete(id);

            if (!deletedPeriodo) return res.status(404).json({ message: "Periodo no encontrado" });
            return res.json({ message: "Periodo eliminado lógicamente", periodo: deletedPeriodo });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

}