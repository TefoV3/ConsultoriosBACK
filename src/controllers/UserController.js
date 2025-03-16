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

    static async createUser(req, res) {
        try {
            const newUser = await UserModel.create(req.body);
            return res.status(201).json(newUser);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedUser = await UserModel.update(id, req.body);
            if (!updatedUser) return res.status(404).json({ message: "User not found" });

            return res.json(updatedUser);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Validation before calling delete()
            if (!id) {
                return res.status(400).json({ error: "User ID is required to delete" });
            }

            const deletedUser = await UserModel.delete(id);
            if (!deletedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.json({ message: "User logically deleted", user: deletedUser });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
