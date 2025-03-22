import { ActivityModel } from "../models/ActivityModel.js";
import { AuditModel } from "../models/AuditModel.js";
import { InternalUserModel } from "../models/InternalUserModel.js";

export class ActivityController {
    static async getActivities(req, res) {
        try {
            const activities = await ActivityModel.getAll();
            res.json(activities);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const activity = await ActivityModel.getById(id);
            if (activity) return res.json(activity);
            res.status(404).json({ message: "Activity not found" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getAllByCodeCase(req, res) {
        const { codeCase } = req.params;
        try {
            const activity = await ActivityModel.getAllByCodeCase(codeCase);
            if (activity) return res.json(activity);
            res.status(404).json({ message: "Activities not found" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async createActivity(req, res) {
        try {
            console.log("📥 Recibiendo solicitud para crear actividad...");
            const { Init_Code } = req.body;

            console.log("🔍 req.user:", req.user);

            if (!req.user) {
                console.error("❌ Usuario no autenticado.");
                return res.status(401).json({ error: "Usuario no autenticado" });
            }

            const internalId = req.user.id;

            console.log("🔍 Internal_ID obtenido:", internalId);

            if (!internalId) {
                console.error("❌ Internal_ID no proporcionado.");
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            // Verificar que el Internal_ID exista en la tabla internal_users
            const internalUser = await InternalUserModel.getById(internalId);
            if (!internalUser) {
                console.error(`❌ El Internal_ID ${internalId} no existe en la tabla internal_users.`);
                return res.status(400).json({ error: `El Internal_ID ${internalId} no existe en la tabla internal_users` });
            }

            if (!req.file) {
                console.error("❌ No se recibió ningún archivo.");
                return res.status(400).json({ error: "Debe adjuntar un archivo PDF." });
            }

            console.log("✅ Archivo recibido:", req.file.originalname);

            // Llamar al modelo y pasar `req.file` y `internalId`
            const newActivity = await ActivityModel.create({ ...req.body, Internal_ID: internalId }, req.file);

            console.log("📝 Registrando auditoría...");

            // Registrar en Audit
            await AuditModel.registerAudit(internalId, "INSERT", "Activity", `El usuario interno ${internalId} creó la actividad con ID ${newActivity.Activity_Id}`);

            console.log("✅ Actividad creada con éxito.");

            res.status(201).json({ message: "Actividad creada con evidencia", data: newActivity });
        } catch (error) {
            console.error("❌ Error en la creación de actividad:", error.message);
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;

            if (!req.user) {
                console.error("❌ Usuario no autenticado.");
                return res.status(401).json({ error: "Usuario no autenticado" });
            }

            const internalId = req.user.id; // ✅ Se obtiene el usuario interno desde req.user

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            const updatedActivity = await ActivityModel.update(id, req.body, internalId);
            if (!updatedActivity) return res.status(404).json({ message: "Activity not found" });

            return res.json(updatedActivity);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;

            if (!req.user) {
                console.error("❌ Usuario no autenticado.");
                return res.status(401).json({ error: "Usuario no autenticado" });
            }

            const internalId = req.user.id; // ✅ Se obtiene el usuario interno desde req.user

            if (!internalId) {
                return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            }

            const deletedActivity = await ActivityModel.delete(id, internalId);
            if (!deletedActivity) return res.status(404).json({ message: "Activity not found" });

            return res.json({ message: "Activity deleted", activity: deletedActivity });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}