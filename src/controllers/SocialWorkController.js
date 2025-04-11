import { SocialWorkModel } from "../models/SocialWorkModel.js";

export class SocialWorkController {
    // Obtener todas las evaluaciones
    static async getAll(req, res) {
        try {
            const records = await SocialWorkModel.getAll();
            res.json(records);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Obtener una evaluación por ID
    static async getById(req, res) {
        const { id } = req.params;
        try {
            const record = await SocialWorkModel.getById(id);
            if (record) return res.json(record);
            res.status(404).json({ message: "Social work record not found" });
        } catch (error) {
            console.error("Error in getById controller:", error);
            res.status(500).json({ error: error.message });
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

    // Crear una evaluación de trabajo social
    static async create(req, res) {
        try {
            const { Init_Code } = req.body;

            if (!Init_Code) {
                return res.status(400).json({ error: "El campo 'Init_Code' es obligatorio." });
            }

            // 🔹 Pasamos `req` para obtener el `Internal_ID` desde el token
            const newSocialWork = await SocialWorkModel.create(req.body, req);

            res.status(201).json({ message: "Registro de trabajo social creado con éxito", data: newSocialWork });
        } catch (error) {
            res.status(500).json({ error: `Error creating social work record: ${error.message}` });
        }
    }

    // Actualizar una evaluación
    static async update(req, res) {
        try {
            const { id } = req.params;
            const data  = req.body;
            
          console.log("ID from request params:", id);

            const updatedRecord = await SocialWorkModel.update(id, data);

            if (!updatedRecord) return res.status(404).json({ message: "Social work record not found" });

            res.json({ message: "Social work record updated successfully", data: updatedRecord });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params; // Extract SocialWork_ID from the request parameters
            const { status, observations } = req.body; // Extract the new status from the request body
    
            if (!status) {
                return res.status(400).json({ error: "Status is required to update the social work record" });
            }
    
            const isUpdated = await SocialWorkModel.updateStatus(id, status, observations);
    
            if (!isUpdated) {
                return res.status(404).json({ message: "Social work record not found or not updated" });
            }
    
            res.json({ message: "Social work status updated successfully" });
        } catch (error) {
            res.status(500).json({ error: `Error updating social work status: ${error.message}` });
        }
    }

    // Eliminar (borrado lógico) una evaluación
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const { Internal_ID } = req.body;

            if (!Internal_ID) {
                return res.status(400).json({ error: "Internal_ID is required for auditing" });
            }

            const deletedRecord = await SocialWorkModel.delete(id, Internal_ID);
            if (!deletedRecord) return res.status(404).json({ message: "Social work record not found" });

            res.json({ message: "Social work record deleted (soft delete)", record: deletedRecord });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}