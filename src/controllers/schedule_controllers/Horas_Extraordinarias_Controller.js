import { Horas_ExtraordinariasModel } from "../../models/schedule_models/Horas_Extraordinarias.js";

export class HorasExtraordinariasController {
    static async getHoras_Extraordinarias(req, res) {
        try {
            const horasExtraordinarias = await Horas_ExtraordinariasModel.getHoras_Extraordinarias();
            res.json(horasExtraordinarias);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const horasExtraordinarias = await Horas_ExtraordinariasModel.getById(id);
            if (horasExtraordinarias) return res.json(horasExtraordinarias)
            res.status(404).json({ message: "Horas extraordinarias no encontradas" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createHoras_Extraordinarias(req, res) {
        try {
            const newHorasExtraordinarias = await Horas_ExtraordinariasModel.create(req.body);
            return res.status(201).json(newHorasExtraordinarias);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedHorasExtraordinarias = await Horas_ExtraordinariasModel.update(id, req.body);

            if (!updatedHorasExtraordinarias) return res.status(404).json({ message: "Horas extraordinarias no encontradas" });

            return res.json(updatedHorasExtraordinarias);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedHorasExtraordinarias = await Horas_ExtraordinariasModel.delete(id);

            if (!deletedHorasExtraordinarias) return res.status(404).json({ message: "Horas extraordinarias no encontradas" });
            return res.json({ message: "Horas extraordinarias eliminadas lógicamente", horasExtraordinarias: deletedHorasExtraordinarias });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async getHoras_ExtraordinariasByUser(req, res) {
        try {
            const horasExtraordinarias = await Horas_ExtraordinariasModel.getHoras_ExtraordinariasByUser(req.params.id);
            res.json(horasExtraordinarias);
        } catch (error) {
            res.status(500).json(error);
        }
    }

}