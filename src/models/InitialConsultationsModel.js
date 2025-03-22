import { sequelize } from "../database/database.js";
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { User } from "../schemas/User.js";
import { InternalUser } from "../schemas/Internal_User.js";
import {AuditModel} from "../models/AuditModel.js"
import { UserModel } from "../models/UserModel.js";
import { Evidence } from "../schemas/Evidences.js";

export class InitialConsultationsModel {

    static async getAll() {
        try {
            return await InitialConsultations.findAll();
        } catch (error) {
            throw new Error(`Error retrieving initial consultations: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await InitialConsultations.findOne({
                where: { Init_Code: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving initial consultation: ${error.message}`);
        }
    }

    static async getByStatus(status) {
        try {
            return await InitialConsultations.findOne({
                where: { Init_Status: status }
            });
        } catch (error) {
            throw new Error(`Error retrieving initial consultation: ${error.message}`);
        }
    }

    static async createInitialConsultation(data,file) {
        const t = await sequelize.transaction();
        let userCreated = false;

        try {
            // Verificar si el usuario externo existe, si no, crearlo
            let user = await User.findOne({ where: { User_ID: data.User_ID }, transaction: t });
            if (!user) {
                user = await UserModel.create({
                    User_ID: data.User_ID, 
                    User_ID_Type: data.User_ID_Type,
                    User_Academic_Instruction: data.User_Academic_Instruction,
                    User_FirstName: data.User_FirstName,
                    User_LastName: data.User_LastName,
                    User_Email: data.User_Email,
                    User_Phone: data.User_Phone,
                    User_Gender: data.User_Gender,
                    User_Ethnicity: data.User_Ethnicity,
                    User_Occupation: data.User_Occupation,
                    User_Address: data.User_Address,
                    User_Nationality: data.User_Nationality,
                    User_Dependents: data.User_Dependents,
                    User_Sector: data.User_Sector,
                    User_Zone: data.User_Zone,
                    User_MaritalStatus: data.User_MaritalStatus,
                    User_Disability: data.User_Disability,
                    User_Benefits: data.User_Benefits,
                    User_BirthDate: data.User_BirthDate,
                    User_IncomeLevel: data.User_IncomeLevel,
                    User_FamilyIncome: data.User_FamilyIncome,
                    User_OwnsHouse: data.User_OwnsHouse,
                    User_OwnsCar: data.User_OwnsCar,
                    User_ReferenceName: data.User_ReferenceName,
                    User_ReferencePhone: data.User_ReferencePhone,
                }, { transaction: t });

                userCreated = true; // Marcar que el usuario fue creado en esta transacción

                // 🔹 Registrar en Audit que un usuario interno creó este usuario externo
                await AuditModel.registerAudit(
                    data.Internal_ID, 
                    "INSERT",
                    "User",
                    `El usuario interno ${data.Internal_ID} creó al usuario externo ${data.User_ID}`
                );
            }

            // Verificar si el usuario interno existe
            const internalUser = await InternalUser.findOne({ where: { Internal_ID: data.Internal_ID }, transaction: t });
            if (!internalUser) {
                throw new Error(`El usuario interno con ID ${data.Internal_ID} no existe.`);
            }

            // Crear la consulta inicial
            const newConsultation = await InitialConsultations.create({
                Init_Code: data.Init_Code,
                Internal_ID: data.Internal_ID,
                User_ID: data.User_ID,
                Init_ClientType: data.Init_ClientType,
                Init_Date: data.Init_Date,
                Init_EndDate: data.Init_EndDate,
                Init_Subject: data.Init_Subject,
                Init_Lawyer: data.Init_Lawyer,
                Init_Notes: data.Init_Notes,
                Init_Office: data.Init_Office,
                Init_Topic: data.Init_Topic,
                Init_Service: data.Init_Service,
                Init_Referral: data.Init_Referral,
                Init_Complexity: data.Init_Complexity,
                Init_Status: data.Init_Status
            }, { transaction: t });

            // 🔹 Registrar en Audit que un usuario interno creó una consulta inicial
            await AuditModel.registerAudit(
                data.Internal_ID, 
                "INSERT",
                "Initial_Consultations",
                `El usuario interno ${data.Internal_ID} creó la consulta inicial ${data.Init_Code} para el usuario ${data.User_ID}`
            );

            // 🔹 Verificar si se subió un archivo PDF
            if (!file) {
                throw new Error("Debe adjuntar un archivo PDF para la evidencia.");
            }

            // 🔹 Crear la evidencia asociada
            const newEvidence = await Evidence.create({
                Internal_ID: data.Internal_ID,
                Init_Code: data.Init_Code,
                Evidence_Name: data.Evidence_Name || file.originalname,
                Evidence_Document_Type: file.mimetype,
                Evidence_URL: null, // Se usa NULL ya que el PDF está en BLOB
                Evidence_Date: new Date(),
                Evidence_File: file.buffer // Guardar el archivo en formato BLOB
            }, { transaction: t });

            // 🔹 Registrar en Audit la creación de la evidencia
            await AuditModel.registerAudit(
                data.Internal_ID, 
                "INSERT",
                "Evidences",
                `El usuario interno ${data.Internal_ID} subió la evidencia ${newEvidence.Evidence_ID} para la consulta ${data.Init_Code}`
            );

            await t.commit();
            return { 
                message: "Consulta inicial y evidencia creadas exitosamente", 
                consultation: newConsultation,
                evidence: newEvidence
            };

        } catch (error) {
            await t.rollback(); // Revertir la transacción en caso de error

            if (userCreated) {
                // Eliminar el usuario creado si se genera un error
                await User.destroy({ where: { User_ID: data.User_ID } });

                // 🔹 Registrar en Audit que se eliminó el usuario por error en la transacción
                await AuditModel.registerAudit(
                    data.Internal_ID, 
                    "DELETE",
                    "User",
                    `El usuario interno ${data.Internal_ID} eliminó al usuario externo ${data.User_ID} debido a un error en la creación de la consulta inicial`
                );
            }

            // 🔹 Registrar el error en Audit
            await AuditModel.registerAudit(
                data.Internal_ID, 
                "ERROR",
                "Initial_Consultations",
                `Error al crear la consulta inicial ${data.Init_Code} para el usuario ${data.User_ID}: ${error.message}`
            );

            throw new Error(`Error al crear la consulta inicial: ${error.message}`);
        }
    }

    


    static async update(id, data, internalId) {
        try {
            const consultation = await this.getById(id);
            if (!consultation) return null;

            const [rowsUpdated] = await InitialConsultations.update(data, {
                where: { Init_Code: id }
            });

            if (rowsUpdated === 0) return null;

            const updatedConsultation = await this.getById(id);

            // 🔹 Registrar en Audit que un usuario interno actualizó una consulta inicial
            await AuditModel.registerAudit(
                internalId, 
                "UPDATE",
                "Initial_Consultations",
                `El usuario interno ${internalId} actualizó la consulta inicial ${id}`
            );

            return updatedConsultation;
        } catch (error) {
            throw new Error(`Error updating initial consultation: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const consultation = await this.getById(id);
            if (!consultation) return null;

            await InitialConsultations.destroy({ where: { Init_Code: id } });

            // 🔹 Registrar en Audit que un usuario interno eliminó una consulta inicial
            await AuditModel.registerAudit(
                internalId, 
                "DELETE",
                "Initial_Consultations",
                `El usuario interno ${internalId} eliminó la consulta inicial ${id}`
            );

            return consultation;
        } catch (error) {
            throw new Error(`Error deleting initial consultation: ${error.message}`);
        }
    }
}
