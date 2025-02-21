import { UsuarioInternoModel } from "../models/Usuario_internoModel.js";

export class UsuarioInternoController {
    static async getUsuariosInternos(req, res) {
        try {
            const usuariosInternos = await UsuarioInternoModel.getAll();
            res.json(usuariosInternos);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const usuarioInterno = await UsuarioInternoModel.getById(id);
            if (usuarioInterno) return res.json(usuarioInterno);
            res.status(404).json({ message: "Usuario interno no encontrado" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createUsuarioInterno(req, res) {
        try {
            const newUsuarioInterno = await UsuarioInternoModel.create(req.body);
            return res.status(201).json(newUsuarioInterno);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedUsuarioInterno = await UsuarioInternoModel.update(id, req.body);
            if (!updatedUsuarioInterno) return res.status(404).json({ message: "Usuario interno no encontrado" });

            return res.json(updatedUsuarioInterno);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedUsuarioInterno = await UsuarioInternoModel.delete(id);
            if (!deletedUsuarioInterno) return res.status(404).json({ message: "Usuario interno no encontrado" });

            return res.json({ message: "Usuario interno eliminado", usuarioInterno: deletedUsuarioInterno });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
