import { Social_Work } from "../schemas/Social_Work.js";
import { AuditModel } from "./AuditModel.js"; // Para registrar en auditoría
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { User } from "../schemas/User.js";
import { getUserId } from '../sessionData.js';

export class Social_WorkModel {
    // Obtener todas las evaluaciones de trabajo social
    static async getAll() {
        try {
            return await Social_Work.findAll();
        } catch (error) {
            throw new Error(`Error retrieving social work records: ${error.message}`);
        }
    }

    // Obtener una evaluación de trabajo social por ID
    static async getById(id) {
        try {
            // Retrieve the social work record with related data
            const social_WorkRecord = await Social_Work.findOne({
                where: { SW_ProcessNumber: id },
                include: [
                    {
                        model: InitialConsultations,
                        attributes: ["User_ID", "Init_Subject"],
                        include: [
                            {
                                model: User,
                                attributes: [
                                    "User_ID",
                                    "User_FirstName",
                                    "User_LastName",
                                    "User_Age",
                                    "User_MaritalStatus",
                                    "User_Profession",
                                    "User_Phone"
                                ]
                            }
                        ]
                    }
                ]
            });
    
            // Return the raw database record or null if not found
            return social_WorkRecord || null;
        } catch (error) {
            console.error("Error in getById:", error);
            throw new Error(`Error retrieving social work record: ${error.message}`);
        }
    }

    // Obtener User_ID desde Social_Work a través de Init_Code
    static async getUserIdBySocial_Work(initCode) {
        try {
            const social_WorkRecord = await Social_Work.findOne({
                where: { Init_Code: initCode },
                include: [
                    {
                        model: InitialConsultations,
                        attributes: ["User_ID"],
                        include: [
                            {
                                model: User,
                                attributes: ["User_ID", "User_FirstName", "User_LastName", "User_Email"]
                            }
                        ]
                    }
                ]
            });

            if (!social_WorkRecord || !social_WorkRecord.Initial_Consultation) {
                return null;
            }

            return social_WorkRecord.Initial_Consultation.User;
        } catch (error) {
            throw new Error(`Error retrieving User_ID from Social_Work using Init_Code ${initCode}: ${error.message}`);
        }
    }
    static async getSocial_WorkById(social_WorkId) {
        try {
            const social_Work = await Social_Work.findOne({
                where: { SW_ProcessNumber: social_WorkId },
                include: [
                    {
                        model: InitialConsultations,
                        attributes: ["User_ID"],
                        include: [
                            {
                                model: User,
                                attributes: ["User_ID", "User_FirstName", "User_LastName"]
                            }
                        ]
                    }
                ]
            });
    
            return social_Work; // Return the result or null if not found
        } catch (error) {
            console.error("Error fetching social work by ID:", error);
            throw new Error("Database error when fetching social work");
        }
    }
    // Crear una evaluación de trabajo social
    static async create(data, req, internalUser) {
        try {
            // 🔹 Obtener `Internal_ID` desde el middleware
            const internalId = internalUser || getUserId();
            
            

            // 🔹 Verificar si el `Init_Code` existe en la tabla `InitialConsultations`
            const initialConsultation = await InitialConsultations.findOne({ 
                where: { Init_Code: data.Init_Code } 
            });

            if (!initialConsultation) {
                throw new Error(`No existe una consulta inicial con Init_Code ${data.Init_Code}`);
            }

            // 🔹 Crear el registro en `Social_Work`
            const newRecord = await Social_Work.create({
                Init_Code: data.Init_Code,
                SW_UserRequests: data.SW_UserRequests || null,
                SW_ReferralAreaRequests: data.SW_ReferralAreaRequests || null,
                SW_ViolenceEpisodes: data.SW_ViolenceEpisodes || null,
                SW_Complaints: data.SW_Complaints || null,
                SW_DisabilityType: data.SW_DisabilityType || null,
                SW_DisabilityPercentage: data.SW_DisabilityPercentage || null,
                SW_HasDisabilityCard: data.SW_HasDisabilityCard || false,
                SW_Status: data.SW_Status || "Activo"
            });

            // 🔹 Registrar en auditoría
            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "Social_Work",
                `El usuario interno ${internalId} creó el registro de trabajo social con ID ${newRecord.SW_ProcessNumber}`
            );

            return newRecord;
        } catch (error) {
            throw new Error(`Error creating social work record: ${error.message}`);
        }
    }

    // Actualizar una evaluación de trabajo social
    static async update(id, data, internalUser) {
        try {
            const record = await this.getById(id);
            if (!record) return null;

            const internalId = internalUser || getUserId();
            const [rowsUpdated] = await Social_Work.update(data, { where: { SW_ProcessNumber: id } });

            if (rowsUpdated === 0) return null;
            
            // 🔹 Registrar en auditoría la actualización
            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Social_Work",
                `El usuario interno ${internalId} actualizó el registro de trabajo social con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
          throw new Error(`Error updating social work record: ${error.message}`);
        }
      }
    static async updateStatus(social_WorkId, status, status_observations) {
        try {
            // First check if the record exists
            const record = await this.getById(social_WorkId);
            
            if (!record) {
                return false;
            }
            
            // Fix: Corrected parameter name from status_obvervations to status_observations
            const [rowsUpdated] = await Social_Work.update(
                {
                    SW_Status: status,
                    SW_Status_Observations: status_observations
                },
                {
                    where: { SW_ProcessNumber: social_WorkId }
                }
            );
    
            return rowsUpdated > 0; // Return true if at least one row was updated
        } catch (error) {
            console.error("Error updating social work status:", error);
            throw new Error("Database error when updating social work status");
        }
    }

    // Eliminar (borrado lógico) una evaluación de trabajo social
    static async delete(id, internalUser) {
        try {
            const record = await this.getById(id);
            if (!record) return null;
            
            const internalId = internalUser || getUserId();
            await Social_Work.update({ SW_Status: false }, { where: { SW_ProcessNumber: id } });

            // 🔹 Registrar en auditoría la eliminación (borrado lógico)
            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "Social_Work",
                `El usuario interno ${internalId} eliminó lógicamente el registro de trabajo social con ID ${id}`
            );

            return record;
        } catch (error) {
            throw new Error(`Error deleting social work record: ${error.message}`);
        }
    }
}