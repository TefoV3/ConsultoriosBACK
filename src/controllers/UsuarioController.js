import { UsuarioModel } from "../models/UsuarioModel.js";

export class UsuarioController {
    static async getUsuario(req, res) {
        try {
            const usuario = await UsuarioModel.getAll();
            res.json(usuario);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const usuario = await UsuarioModel.getById(id);
            if (usuario) return res.json(usuario);
            res.status(404).json({ message: "Usuario no encontrado" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createUsuario(req, res) {
        try {
            const newUsuario = await UsuarioModel.create(req.body);
            return res.status(201).json(newUsuario);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedUsuario = await UsuarioModel.update(id, req.body);
            if (!updatedUsuario) return res.status(404).json({ message: "Usuario no encontrado" });

            return res.json(updatedUsuario);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedUsuario = await UsuarioModel.delete(id);
            if (!deletedUsuario) return res.status(404).json({ message: "Usuario no encontrado" });

            return res.json({ message: "Usuario eliminado lógicamente", usuario: deletedUsuario });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
