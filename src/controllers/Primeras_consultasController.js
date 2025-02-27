import { PrimerasConsultasModel } from "../models/Primeras_consultasModel.js";

export class PrimerasConsultasController {
    static async getPrimerasConsultas(req, res) {
        try {
            const consultas = await PrimerasConsultasModel.getAll();
            res.json(consultas);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const consulta = await PrimerasConsultasModel.getById(id);
            if (consulta) return res.json(consulta);
            res.status(404).json({ message: "Primera consulta no encontrada" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    /*
    static async createPrimeraConsulta(req, res) {
        try {
            const newConsulta = await PrimerasConsultasModel.create(req.body);
            return res.status(201).json(newConsulta);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }*/

    static async createPrimerasConsultas(req, res) {
        try {
            const response = await PrimerasConsultasModel.createPrimerasConsultas(req.body);
            res.status(201).json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedConsulta = await PrimerasConsultasModel.update(id, req.body);
            if (!updatedConsulta) return res.status(404).json({ message: "Primera consulta no encontrada" });

            return res.json(updatedConsulta);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedConsulta = await PrimerasConsultasModel.delete(id);
            if (!deletedConsulta) return res.status(404).json({ message: "Primera consulta no encontrada" });

            return res.json({ message: "Primera consulta eliminada", consulta: deletedConsulta });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
