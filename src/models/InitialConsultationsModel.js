import { sequelize } from "../database/database.js";
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { User } from "../schemas/User.js";
import { InternalUser } from "../schemas/Internal_User.js";
import {AuditModel} from "../models/AuditModel.js"
import { UserModel } from "../models/UserModel.js";
import { Evidence } from "../schemas/Evidences.js";
import { getUserId } from '../sessionData.js';
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit'; // Importa fontkit correctamente
import fs from 'fs';

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


    static async findById(id) {
        try {
            return await InitialConsultations.findOne({
                where: { Init_Code: id },
                include: [
                    {
                        model: User,
                        attributes: ["User_ID", "User_FirstName", "User_LastName", "User_Age", "User_Phone"]
                    }
                ]
            });
        } catch (error) {
            throw new Error(`Error retrieving consultation: ${error.message}`);
        }
    }

    static async getByUserId(userId) {
        try {
            return await InitialConsultations.findAll({
                where: { User_ID: userId }
            });
        } catch (error) {
            throw new Error(`Error fetching consultations: ${error.message}`);
        }
    }

    static async getByInitTypeAndSubjectCases(initType, initSubject, initStatus) {
        try {
            return await InitialConsultations.findAll({
                where: {
                    Init_Type: initType,
                    Init_Subject: initSubject,
                    Init_Status: initStatus
                }
            });
        } catch (error) {
            throw new Error(`Error fetching consultations: ${error.message}`);
        }
    }
    
    static async getByInitTypeAndSubjectAndStatus(initType, initSubject, initStatus) {
        try {
            return await InitialConsultations.findAll({
                where: {
                    Init_Type: initType,
                    Init_Subject: initSubject,
                    Init_Status: initStatus
                }
            });
        } catch (error) {
            throw new Error(`Error fetching consultations: ${error.message}`);
        }
    }

    static async getByTypeAndStatus(initType, initStatus) {
        try {
            return await InitialConsultations.findAll({
                where: {
                    Init_Type: initType,
                    Init_Status: initStatus
                }
                
            });
        } catch (error) {
            throw new Error(`Error fetching consultations: ${error.message}`);
        }
    }


    static async createInitialConsultation(data,files) {
        const userId = getUserId();

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
                    User_AcademicInstruction: data.User_AcademicInstruction,
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
                    User_HealthDocumentsName: data.User_HealthDocumentsName,
                }, { transaction: t });
                console.log("Buffer de documento de salud:", healthDocument ? healthDocument.buffer : "No hay archivo de documento de salud");

                userCreated = true; // Marcar que el usuario fue creado en esta transacción

                // 🔹 Registrar en Audit que un usuario interno creó este usuario externo
                await AuditModel.registerAudit(
                    userId, 
                    "INSERT",
                    "User",
                    `El usuario interno ${userId} creó al usuario externo ${data.User_ID}`
                );
            }

            // Verificar si el usuario interno existe
            const internalUser = await InternalUser.findOne({ where: { Internal_ID: userId }, transaction: t });
            if (!internalUser) {
                throw new Error(`El usuario interno con ID ${userId} no existe.`);
            }

            // Obtener el último Init_Code ordenado descendentemente
            const lastRecord = await InitialConsultations.findOne({
                order: [['Init_Code', 'DESC']],
                transaction: t
            });

            let lastNumber = 0;
            if (lastRecord && lastRecord.Init_Code) {
                const lastCode = lastRecord.Init_Code;
                const numberPart = lastCode.substring(3); // Extraer número después de "AT-"
                lastNumber = parseInt(numberPart, 10);
            }

            const newNumber = lastNumber + 1;
            const newCode = `AT-${String(newNumber).padStart(6, '0')}`;


            // Crear la consulta inicial
            const newConsultation = await InitialConsultations.create({
                Init_Code: newCode,
                Internal_ID: userId,
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

            console.log("🔹 Nuevo Init_Code generado:", newConsultation.Init_Code); // ✅ Verificar que tiene valor

            // Validar que Init_Code no sea null antes de continuar
            if (!newConsultation.Init_Code) {
                throw new Error("No se pudo generar Init_Code para la consulta.");
            }

            // 🔹 Registrar en Audit que un usuario interno creó una consulta inicial
            await AuditModel.registerAudit(
                userId, 
                "INSERT",
                "Initial_Consultations",
                `El usuario interno ${userId} creó la consulta inicial ${data.Init_Code} para el usuario ${data.User_ID}`
            );

            // 🔹 Crear la evidencia asociada
            const newEvidence = await Evidence.create({
                Internal_ID: userId,
                Init_Code: newConsultation.Init_Code,
                Evidence_Name: evidenceFile ? evidenceFile.originalname : "Sin Documento",
                Evidence_Document_Type: evidenceFile ? evidenceFile.mimetype : null,
                Evidence_URL: null,
                Evidence_Date: new Date(),
                Evidence_File: evidenceFile ? evidenceFile.buffer : null, // Archivo de evidencia
            }, { transaction: t });
            console.log("Buffer de evidencia:", evidenceFile ? evidenceFile.buffer : "No hay archivo de evidencia");

            // 🔹 Registrar en Audit la creación de la evidencia
            await AuditModel.registerAudit(
                userId, 
                "INSERT",
                "Evidences",
                `El usuario interno ${userId} subió la evidencia ${newEvidence.Evidence_ID} para la consulta ${data.Init_Code}`
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
                    userId, 
                    "DELETE",
                    "User",
                    `El usuario interno ${userId} eliminó al usuario externo ${data.User_ID} debido a un error en la creación de la consulta inicial`
                );
            }

            throw new Error(`Error al crear la consulta inicial: ${error.message}`);
        }
    }


    static async createNewConsultation(data) {
        const internalId = getUserId();
        const t = await sequelize.transaction();
        try {
            let user = await User.findOne({ where: { User_ID: data.User_ID }, transaction: t });
            if (!user) {
                throw new Error(`El usuario externo con ID ${data.User_ID} no existe.`);
            }

            // Verificar si el usuario interno existe
            const internalUser = await InternalUser.findOne({ where: { Internal_ID: internalId }, transaction: t });
            if (!internalUser) {
                throw new Error(`El usuario interno con ID ${internalId} no existe.`);
            }

            // Obtener el último Init_Code ordenado descendentemente
            const lastRecord = await InitialConsultations.findOne({
                order: [['Init_Code', 'DESC']],
                transaction: t
            });

            let lastNumber = 0;
            if (lastRecord && lastRecord.Init_Code) {
                const lastCode = lastRecord.Init_Code;
                const numberPart = lastCode.substring(3); // Extraer número después de "AT-"
                lastNumber = parseInt(numberPart, 10);
            }

            const newNumber = lastNumber + 1;
            const newCode = `AT-${String(newNumber).padStart(6, '0')}`;

            const newConsultation = await InitialConsultations.create({
                Init_Code: newCode,
                Internal_ID: internalId,
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

            });
            

            // 🔹 Registrar en Audit que un usuario interno creó una consulta inicial
            await AuditModel.registerAudit(
                internalId, 
                "INSERT",
                "Initial_Consultations",
                `El usuario interno ${internalId} creó una nueva consulta inicial ${newConsultation.Init_Code} para el usuario ${data.User_ID}`
            );

            return newConsultation;
        } catch (error) {
            throw new Error(`Error creating new initial consultation: ${error.message}`);
        }
    }
    

    static async update(id, data) {
        try {
            const consultation = await this.getById(id);
            if (!consultation) return null;
    
            const internalId = getUserId();
    
            const [rowsUpdated] = await InitialConsultations.update(data, {
                where: { Init_Code: id }
            });
    
            if (rowsUpdated === 0) return null;
    
            const updatedConsultation = await this.getById(id);
    
            // 🔹 Registrar en auditoría la actualización
            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "Initial_Consultations",
                `El usuario interno ${internalId} actualizó la consulta inicial ${id}`
            );
    
            // 🔹 Verificar si se debe insertar en SocialWork
        if (data.SW_Status === true && consultation.SW_Status !== true) {  
            // 📌 Solo insertar si antes era `false` y ahora es `true`
            
            const currentDate = moment().format("YYYY-MM-DD"); // Obtener la fecha actual
            const count = await SocialWork.count({ 
                where: { createdAt: { [Op.startsWith]: currentDate } } 
            }) + 1; // Contar registros de hoy y sumar 1

            const swProcessNumber = `TS${currentDate.replace(/-/g, "")}-${String(count).padStart(5, "0")}`;

            await SocialWork.create({
                SW_ProcessNumber: swProcessNumber, // 📌 Ahora se genera con el formato correcto
                SW_UserRequests: null,
                SW_ReferralAreaRequests: null,
                SW_ViolenceEpisodes: null,
                SW_Complaints: null,
                SW_DisabilityType: null,
                SW_DisabilityPercentage: null,
                SW_HasDisabilityCard: null,
                SW_Status: true,
                Init_Code: id
            });

            console.log(`✅ Se insertó un registro en SocialWork con SW_ProcessNumber: ${swProcessNumber}`);
            await AuditModel.registerAudit(
                internalId, 
                "INSERT",
                "SocialWork",
                `El usuario interno ${internalId} creó el registro de trabajo social con ID ${swProcessNumber}`
            );
        }

        return updatedConsultation;
        } catch (error) {
            throw new Error(`Error updating initial consultation: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const consultation = await this.getById(id);
            if (!consultation) return null;

            const internalId = getUserId();
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


    
    
     
    static async generateAttentionSheetBuffer(data) {
        try {
            // Traemos los datos del usuario de forma asíncrona
            const userData = await User.findOne({
                where: { User_ID: data.User_ID },
                attributes: ["User_FirstName", "User_LastName", "User_Age", "User_Phone"]
            });
    
            if (!userData) {
                throw new Error("No se encontraron datos del usuario.");
            }
    
            console.log("Datos del usuario:", userData);
    
            // Limpiar etiquetas HTML del campo Init_Notes
            const cleanNotes = data.Init_Notes.replace(/<\/?[^>]+(>|$)/g, "");

       
            // Cargar la plantilla PDF
            const templatePath = './src/docs/FICHA DE ATENCION.pdf'; // Asegúrate de que la ruta sea correcta
            const templateBytes = fs.readFileSync(templatePath);
    
            // Crear un nuevo documento PDF basado en la plantilla
            const pdfDoc = await PDFDocument.load(templateBytes);
    
           // Registrar fontkit antes de usarlo
            pdfDoc.registerFontkit(fontkit);

            // Cargar la fuente Aptos
            const AptosBytes = fs.readFileSync('./src/docs/Aptos.ttf'); // Asegúrate de que la ruta sea correcta
            const AptosFont = await pdfDoc.embedFont(AptosBytes);


    
            // Obtener la primera página del PDF
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const fontSize = 11; // Tamaño de fuente para los textos

    
            // Rellenar los campos con los datos proporcionados
            firstPage.drawText(`${data.User_ID}`, {
                x: 113,
                y: 655,
                size: fontSize,
                font: AptosFont,
            });
    
            firstPage.drawText(`${userData.User_FirstName} ${userData.User_LastName}`, {
                x: 123,
                y: 632,
                size: fontSize,
                font: AptosFont,
            });
    
            firstPage.drawText(`${data.Init_Date ? new Date(data.Init_Date).toLocaleDateString() : ""}`, {
                x: 397,
                y: 655,
                size: fontSize,
                font: AptosFont,
            });
    
            firstPage.drawText(`${userData.User_Age}`, {
                x: 391,
                y: 632,
                size: fontSize,
                font: AptosFont,
            });
    
            firstPage.drawText(`${userData.User_Phone}`, {
                x: 120,
                y: 608,
                size: fontSize,
                font: AptosFont,
            });
    
            firstPage.drawText(`${data.Init_Subject}`, {
                x: 116,
                y: 584.5,
                size: fontSize,
                font: AptosFont,
            });
    
            firstPage.drawText(`${data.Init_Service}`, {
                x: 448,
                y: 608,
                size: fontSize,
                font: AptosFont,
            });
    
            firstPage.drawText(cleanNotes, {
                x: 76,
                y: 536,
                size: 10,
                font: AptosFont,
                maxWidth: 500,
                lineHeight: 14,
                
            });
    
            firstPage.drawText(`${userData.User_FirstName} ${userData.User_LastName}`, {
                x: 92,
                y: 194.5,
                size: 10,
                font: AptosFont,
            });
            firstPage.drawText(`${data.User_ID}`, {
                x: 284,
                y: 194.5,
                size: 10,
                font: AptosFont,
            });
    
            // Generar el PDF modificado
            const pdfBytes = await pdfDoc.save();
    
            // Retornar el buffer del PDF generado
            return Buffer.from(pdfBytes);
        } catch (error) {
            console.error("Error generando el buffer del PDF:", error);
            throw error;
        }
    }


    
}
