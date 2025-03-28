import { UsuarioXPeriodoModel } from "../../models/schedule_models/UsuarioXPeriodo.js";

export class UsuarioXPeriodoController {
    static async getUsuarioXPeriodos(req, res) {
        try {
            const usuarioXPeriodos = await UsuarioXPeriodoModel.getUsuarioXPeriodos();
            res.json(usuarioXPeriodos);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { periodoId, usuarioCedula } = req.params;
        try {
            const usuarioXPeriodo = await UsuarioXPeriodoModel.getById(periodoId, usuarioCedula);
            if (usuarioXPeriodo) return res.json(usuarioXPeriodo)
            res.status(404).json({ message: "UsuarioXPeriodo no encontrado" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getUsuariosAndPeriodosAll(req, res) {
        try {
            const usuariosAndPeriodos = await UsuarioXPeriodoModel.getUsuariosAndPeriodosAll();
            res.json(usuariosAndPeriodos);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    
    static async getByCedula (req,res) {
        const {usuarioCedula} = req.params;
        try{
            const usuarioXPeriodo = await UsuarioXPeriodoModel.getByCedula(usuarioCedula);
            if (usuarioXPeriodo) return res.json(usuarioXPeriodo)
            res.status(404).json({message: "UsuarioXPeriodo no encontrado"});
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getUsuariosAndPeriodosByPeriodo(req, res) {
        const { periodoId } = req.params;
        console.log("getUsuariosAndPeriodosByPeriodo");
        try {
            const usuariosAndPeriodos = await UsuarioXPeriodoModel.getUsuariosAndPeriodosByPeriodo(periodoId);
            res.json(usuariosAndPeriodos);
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }

    static async getByPeriodoAndCedula(req, res) {
        const { periodoId, cedula } = req.params;
        try {
            const usuarioXPeriodo = await UsuarioXPeriodoModel.getByPeriodoAndCedula(periodoId, cedula);
            if (usuarioXPeriodo) return res.json(usuarioXPeriodo)
            res.status(404).json({ message: "UsuarioXPeriodo no encontrado" });
        } catch (error) {
            res.status(500).json(error);
        }
    }
    
    static async getUsuariosByPeriodoAndArea(req, res) {
        const { periodoId, area } = req.params;
        try {
            const usuarios = await UsuarioXPeriodoModel.getUsuariosByPeriodoAndArea(periodoId, area);
            if (usuarios) return res.json(usuarios)
            res.status(404).json({ message: "Usuarios no encontrados" });
        } catch (error) {
            res.status(500).json(error);
        }
    }
    
    static async create(req, res) {
        try {
            const newUsuarioXPeriodo = await UsuarioXPeriodoModel.create(req.body);
            return res.status(201).json(newUsuarioXPeriodo);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { periodoId, usuarioCedula } = req.params;
            const updatedUsuarioXPeriodo = await UsuarioXPeriodoModel.update(periodoId, usuarioCedula, req.body);

            if (!updatedUsuarioXPeriodo) return res.status(404).json({ message: "UsuarioXPeriodo no encontrado" });

            return res.json(updatedUsuarioXPeriodo);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { periodoId, usuarioCedula } = req.params;
            const deletedUsuarioXPeriodo = await UsuarioXPeriodoModel.delete(periodoId, usuarioCedula);

            if (!deletedUsuarioXPeriodo) return res.status(404).json({ message: "UsuarioXPeriodo no encontrado" });
            return res.json({ message: "UsuarioXPeriodo eliminado lógicamente", usuarioXPeriodo: deletedUsuarioXPeriodo });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

}