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
            return await SocialWork.findOne({ where: { ProcessNumber: id } });
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
                                attributes: ["User_ID", "User_FirstName", "User_LastName", "User_Age", "User_Profession", "User_MaritalStatus", "User_Address", "User_Phone"]
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
    static async create(data, internalId) {
        try {
            const newRecord = await SocialWork.create(data);

            // 🔹 Registrar en auditoría la creación
            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "SocialWork",
                `El usuario interno ${internalId} creó el registro de trabajo social con ID ${newRecord.ProcessNumber}`
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

            const [rowsUpdated] = await SocialWork.update(data, { where: { ProcessNumber: id } });

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

            await SocialWork.update({ Status: false }, { where: { ProcessNumber: id } });

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
