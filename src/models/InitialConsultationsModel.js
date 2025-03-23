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

    static async getByUserId(userId) {
        try {
            return await InitialConsultations.findAll({
                where: { User_ID: userId }
            });
        } catch (error) {
            throw new Error(`Error retrieving initial consultations by user ID: ${error.message}`);
        }
    }

    static async getByStatus(status) {
        try {
            return await InitialConsultations.findAll({
                where: { Init_Status: status }
            });
        } catch (error) {
            throw new Error(`Error retrieving initial consultations by status: ${error.message}`);
        }
    }

    static async getAllActiveCasesByInternalID(internalId) {
        try {
            return await InitialConsultations.findAll({
                where: {
                    Init_Status: 1,
                    Internal_ID: internalId
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving active initial consultations for internal user ${internalId}: ${error.message}`);
        }
    }

    static async getAllInactiveCasesByInternalID(internalId) {
        try {
            return await InitialConsultations.findAll({
                where: {
                    Init_Status: 0,
                    Internal_ID: internalId
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving inactive initial consultations for internal user ${internalId}: ${error.message}`);
        }
    }

    static async createInitialConsultation(data,files) {
        const t = await sequelize.transaction();
        let userCreated = false;

        try {
            const evidenceFile = files?.evidenceFile || null;
            const healthDocument = files?.healthDocuments || null;

            // Verificar si el usuario externo existe, si no, crearlo
            let user = await User.findOne({ where: { User_ID: data.User_ID }, transaction: t });
            if (!user) {
                user = await UserModel.create({
                    User_ID: data.User_ID,
                    User_ID_Type: data.User_ID_Type,
                    User_Age: data.User_Age,
                    User_FirstName: data.User_FirstName,
                    User_LastName: data.User_LastName,
                    User_Gender: data.User_Gender,
                    User_BirthDate: data.User_BirthDate,
                    User_Nationality: data.User_Nationality,
                    User_Ethnicity: data.User_Ethnicity,
                    User_Province: data.User_Province,
                    User_City: data.User_City,
                    User_Phone: data.User_Phone,
                    User_Email: data.User_Email,
                    User_Address: data.User_Address,
                    User_Sector: data.User_Sector,
                    User_Zone: data.User_Zone,
                    User_ReferenceRelationship: data.User_ReferenceRelationship,
                    User_ReferenceName: data.User_ReferenceName,
                    User_ReferencePhone: data.User_ReferencePhone,
                    
                    User_SocialBenefit: data.User_SocialBenefit,
                    User_EconomicDependence: data.User_EconomicDependence,
                    User_Academic_Instruction: data.User_Academic_Instruction,
                    User_Profession: data.User_Profession,
                    User_MaritalStatus: data.User_MaritalStatus,
                    User_Dependents: data.User_Dependents,
                    User_IncomeLevel: data.User_IncomeLevel,
                    User_FamilyIncome: data.User_FamilyIncome,
                    User_FamilyGroup: data.User_FamilyGroup,
                    User_EconomicActivePeople: data.User_EconomicActivePeople,
                    
                    User_OwnAssets: data.User_OwnAssets,
                    User_HousingType: data.User_HousingType,
                    User_Pensioner: data.User_Pensioner,
                    User_HealthInsurance: data.User_HealthInsurance,
                    User_VulnerableSituation: data.User_VulnerableSituation,
                    User_SupportingDocuments: data.User_SupportingDocuments,
                    User_Disability: data.User_Disability,
                    User_DisabilityPercentage: data.User_DisabilityPercentage,
                    User_CatastrophicIllness: data.User_CatastrophicIllness,
                    User_HealthDocuments: healthDocument ? healthDocument.buffer : null,

                }, { transaction: t });
                console.log("Buffer de documento de salud:", healthDocument ? healthDocument.buffer : "No hay archivo de documento de salud");

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
                Init_Status: data.Init_Status,
                Init_SocialWork : data.Init_SocialWork,
                Init_Type: data.Init_Type,
            }, { transaction: t });

            // 🔹 Registrar en Audit que un usuario interno creó una consulta inicial
            await AuditModel.registerAudit(
                data.Internal_ID, 
                "INSERT",
                "Initial_Consultations",
                `El usuario interno ${data.Internal_ID} creó la consulta inicial ${data.Init_Code} para el usuario ${data.User_ID}`
            );

            // 🔹 Verificar si se subió un archivo PDF


            // 🔹 Crear la evidencia asociada
            const newEvidence = await Evidence.create({
                Internal_ID: data.Internal_ID,
                Init_Code: data.Init_Code,
                Evidence_Name: evidenceFile ? evidenceFile.originalname : "Sin Documento",
                Evidence_Document_Type: evidenceFile ? evidenceFile.mimetype : null,
                Evidence_URL: null,
                Evidence_Date: new Date(),
                Evidence_File: evidenceFile ? evidenceFile.buffer : null, // Archivo de evidencia
            }, { transaction: t });
            console.log("Buffer de evidencia:", evidenceFile ? evidenceFile.buffer : "No hay archivo de evidencia");

            // 🔹 Registrar en Audit la creación de la evidencia
            await AuditModel.registerAudit(
                data.Internal_ID, 
                "INSERT",
                "Evidences",
                `El usuario interno ${data.Internal_ID} subió la evidencia ${newEvidence.Evidence_ID} para la consulta ${data.Init_Code}`
            );

            await t.commit();
            return { 
                message: "Consulta inicial ", 
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
