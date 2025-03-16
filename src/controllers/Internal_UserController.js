import { InternalUserModel } from "../models/Internal_UserModel.js";

export class InternalUserController {
    static async getInternalUsers(req, res) {
        try {
            const internalUsers = await InternalUserModel.getAll();
            res.json(internalUsers);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const internalUser = await InternalUserModel.getById(id);
            if (internalUser) return res.json(internalUser);
            res.status(404).json({ message: "Internal user not found" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createInternalUser(req, res) {
        try {
            const newInternalUser = await InternalUserModel.create(req.body);
            return res.status(201).json(newInternalUser);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedInternalUser = await InternalUserModel.update(id, req.body);
            if (!updatedInternalUser) return res.status(404).json({ message: "Internal user not found" });

            return res.json(updatedInternalUser);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedInternalUser = await InternalUserModel.delete(id);
            if (!deletedInternalUser) return res.status(404).json({ message: "Internal user not found" });

            return res.json({ message: "Internal user deleted", internalUser: deletedInternalUser });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
