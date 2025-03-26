import { SocialWork } from "../schemas/SocialWork.js";
import { AuditModel } from "./AuditModel.js"; // Para registrar en auditoría
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { User } from "../schemas/User.js";

export class SocialWorkModel {
    // Obtener todas las evaluaciones de trabajo social
    static async getAll() {
        try {
            return await SocialWork.findAll();
        } catch (error) {
            throw new Error(`Error retrieving social work records: ${error.message}`);
        }
    }

    // Obtener una evaluación de trabajo social por ID
    static async getById(id) {
        try {
            return await SocialWork.findOne({ where: { SW_ProcessNumber: id } });
        } catch (error) {
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

    // Crear una evaluación de trabajo social
    static async create(data, req) {
        try {
            // 🔹 Obtener `Internal_ID` desde el middleware
            const internalId = req.user?.id;
            if (!internalId) {
                throw new Error("No se pudo recuperar el Internal_ID del token.");
            }

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
    static async update(id, data, internalId) {
        try {
            const record = await this.getById(id);
            if (!record) return null;

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

    // Eliminar (borrado lógico) una evaluación de trabajo social
    static async delete(id, internalId) {
        try {
            const record = await this.getById(id);
            if (!record) return null;

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