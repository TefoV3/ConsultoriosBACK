import { SocialWork } from "../schemas/SocialWork.js";
import { AuditModel } from "./AuditModel.js"; // Para registrar en auditoría
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { User } from "../schemas/User.js";
import { getUserId } from '../sessionData.js';

export class SocialWorkModel {
    // Obtener todas las evaluaciones de trabajo social
    static async getAll() {
        try {
            return await SocialWork.findAll();
        } catch (error) {
            throw new Error(`Error retrieving social work records: ${error.message}`);
        }
    }

    // New method to get all users with social work records
    static async getAllUsersWithSocialWork() {
        try {
            // We're querying from User and including necessary relations
            const users = await User.findAll({
                include: [
                    {
                        model: InitialConsultations,
                        required: true, // Only include users that have an initial consultation
                        include: [
                            {
                                model: SocialWork,
                                required: true // Only include initial consultations that have social work records
                            }
                        ]
                    }
                ]
            });
            
            // Log the structure of the first user for debugging
            if (users.length > 0) {
                console.log("Sample user data structure:", JSON.stringify({
                    userId: users[0].User_ID,
                    firstName: users[0].User_FirstName,
                    consultations: users[0].Initial_Consultations ? 
                      users[0].Initial_Consultations.length : 'none',
                    firstConsultationId: users[0].Initial_Consultations && 
                      users[0].Initial_Consultations.length > 0 ? 
                      users[0].Initial_Consultations[0].Init_Code : 'none',
                    socialWorkId: users[0].Initial_Consultations && 
                      users[0].Initial_Consultations.length > 0 && 
                      users[0].Initial_Consultations[0].SocialWork ? 
                      users[0].Initial_Consultations[0].SocialWork.SW_ProcessNumber : 'none'
                }, null, 2));
            }
            
            return users;
        } catch (error) {
            console.error("Error in getAllUsersWithSocialWork:", error);
            throw new Error(`Error retrieving users with social work records: ${error.message}`);
        }
    }
    
    // Obtener una evaluación de trabajo social por ID
    static async getById(id) {
        try {
            // Retrieve the social work record with related data
            const socialWorkRecord = await SocialWork.findOne({
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
            return socialWorkRecord || null;
        } catch (error) {
            console.error("Error in getById:", error);
            throw new Error(`Error retrieving social work record: ${error.message}`);
        }
    }

    // Obtener User_ID desde SocialWork a través de Init_Code
    static async getUserIdBySocialWork(initCode) {
        try {
            const socialWorkRecord = await SocialWork.findOne({
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

            if (!socialWorkRecord || !socialWorkRecord.Initial_Consultation) {
                return null;
            }

            return socialWorkRecord.Initial_Consultation.User;
        } catch (error) {
            throw new Error(`Error retrieving User_ID from SocialWork using Init_Code ${initCode}: ${error.message}`);
        }
    }
    static async getSocialWorkById(socialWorkId) {
        try {
            const socialWork = await SocialWork.findOne({
                where: { SW_ProcessNumber: socialWorkId },
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
    
            return socialWork; // Return the result or null if not found
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

            // 🔹 Crear el registro en `SocialWork`
            const newRecord = await SocialWork.create({
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
                "SocialWork",
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
            const [rowsUpdated] = await SocialWork.update(data, { where: { SW_ProcessNumber: id } });

            if (rowsUpdated === 0) return null;
            
            // 🔹 Registrar en auditoría la actualización
            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "SocialWork",
                `El usuario interno ${internalId} actualizó el registro de trabajo social con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
          throw new Error(`Error updating social work record: ${error.message}`);
        }
      }
      static async updateStatus(socialWorkId, status, status_observations) {
        try {
            // First check if the record exists
            const record = await this.getById(socialWorkId);
            
            if (!record) {
                return false;
            }
            
            // Fix: Corrected parameter name from status_obvervations to status_observations
            const [rowsUpdated] = await SocialWork.update(
                {
                    SW_Status: status,
                    SW_Status_Observations: status_observations
                },
                {
                    where: { SW_ProcessNumber: socialWorkId }
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
            await SocialWork.update({ SW_Status: false }, { where: { SW_ProcessNumber: id } });

            // 🔹 Registrar en auditoría la eliminación (borrado lógico)
            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "SocialWork",
                `El usuario interno ${internalId} eliminó lógicamente el registro de trabajo social con ID ${id}`
            );

            return record;
        } catch (error) {
            throw new Error(`Error deleting social work record: ${error.message}`);
        }
    }
}