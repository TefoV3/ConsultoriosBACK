import { UserModel } from "../models/UserModel.js";

export class UserController {
    static async getUsers(req, res) {
        try {
            const users = await UserModel.getAll();
            res.json(users);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const user = await UserModel.getById(id);
            if (user) return res.json(user);
            res.status(404).json({ message: "User not found" });
        } catch (error) {
            res.status(500).json(error);
        }
    }
    
    // Obtener User_ID desde SocialWork a través de Init_Code
    static async getUserIdBySocialWork(req, res) {
        try {
            const { initCode } = req.params;

            if (!initCode) {
                return res.status(400).json({ error: "Init_Code is required." });
            }

            const user = await SocialWorkModel.getUserIdBySocialWork(initCode);

            if (!user) {
                return res.status(404).json({ message: `No user found for Init_Code ${initCode}.` });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    static async createUser(req, res) {
        try {
            const internalId = req.headers["internal-id"];  // ✅ Se obtiene el usuario interno desde los headers

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            const newUser = await UserModel.create(req.body, internalId);

            return res.status(201).json(newUser);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];
            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }
            const updatedUser = await UserModel.update(id, req.body, internalId);
            if (!updatedUser) return res.status(404).json({ message: "User not found" });

            return res.json(updatedUser);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];  // ✅ Se obtiene el usuario interno desde los headers

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            const deletedUser = await UserModel.delete(id, internalId);

            if (!deletedUser) return res.status(404).json({ message: "Usuario no encontrado" });

            return res.json({ message: "Usuario eliminado lógicamente", usuario: deletedUser });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
