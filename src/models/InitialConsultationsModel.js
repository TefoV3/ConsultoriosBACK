import { sequelize } from "../database/database.js";
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { User } from "../schemas/User.js";
import { InternalUser } from "../schemas/Internal_User.js";
import { AuditModel } from "../models/AuditModel.js";
import { UserModel } from "../models/UserModel.js";
import { Evidence } from "../schemas/Evidences.js";
import { getUserId } from "../sessionData.js";
import { PDFDocument } from "pdf-lib";
import { SocialWork } from "../schemas/SocialWork.js"; // Asegúrate de que la ruta sea correcta
import { Op } from "sequelize";
import moment from 'moment-timezone'; // Use moment-timezone
import fontkit from "@pdf-lib/fontkit"; 
import fs from "fs";
import ExcelJS from 'exceljs'; 

function buildInitAlertNote({
  prefix = "",
  User_AcademicInstruction,
  User_Profession,
  User_IncomeLevel,
  User_FamilyIncome,
  prefix2 = "",
  Init_Subject,
  prefix3 = "",
  User_City,
}) {
  const messages = [];

  // Validaciones socioeconómicas
  const socioEconomicMessages = [];
  if (
    ["Superior", "Postgrado", "Doctorado"].includes(User_AcademicInstruction)
  ) {
    socioEconomicMessages.push(
      `<br>El usuario tiene una instrucción: ${User_AcademicInstruction}.`
    );
  }
  if (["Empleado Privado", "Patrono", "Socio"].includes(User_Profession)) {
    socioEconomicMessages.push(
      `<br>El usuario tiene una profesión: ${User_Profession}.`
    );
  }
  if (["3 SBU", "4 SBU", "5 SBU", ">5 SBU"].includes(User_IncomeLevel)) {
    socioEconomicMessages.push(
      `<br>El usuario tiene un nivel de ingresos: ${User_IncomeLevel}.`
    );
  }
  if (["3 SBU", "4 SBU", "5 SBU", ">5 SBU"].includes(User_FamilyIncome)) {
    socioEconomicMessages.push(
      `<br>El usuario tiene un ingreso familiar: ${User_FamilyIncome}.`
    );
  }
  if (socioEconomicMessages.length > 0) {
    messages.push(
      `<strong>${prefix}</strong>${socioEconomicMessages.join(" ")}`
    );
  }

  // Validación de materia
  if (["Tierras", "Administrativo", "Constitucional"].includes(Init_Subject)) {
    messages.push(
      `<br><strong>${prefix2}</strong><br>El usuario busca atención en la materia de: ${Init_Subject}.`
    );
  }

  // Validación de ciudad
  if (!["Quito"].includes(User_City)) {
    messages.push(
      `<br><strong>${prefix3}</strong><br>El usuario reside en: ${User_City}`
    );
  }

  return messages.length > 0 ? messages.join("<br>") : null;
}

export class InitialConsultationsModel {
  static async getAll() {
    try {
      return await InitialConsultations.findAll({
        attributes: {
          exclude: ["Init_AttentionSheet"],
        },
      });
    } catch (error) {
      throw new Error(
        `Error retrieving initial consultations: ${error.message}`
      );
    }
  }

  static async getById(id) {
    try {
      return await InitialConsultations.findOne({
        where: { Init_Code: id },
        attributes: {
          exclude: ["Init_AttentionSheet"],
        },
      });
    } catch (error) {
      throw new Error(
        `Error retrieving initial consultation: ${error.message}`
      );
    }
  }

  static async findById(id) {
    try {
      return await InitialConsultations.findOne({
        where: { Init_Code: id },
        include: [
          {
            model: User,
            attributes: [
              "User_ID",
              "User_FirstName",
              "User_LastName",
              "User_Age",
              "User_Phone",
            ],
          },
        ],
      });
    } catch (error) {
      throw new Error(`Error retrieving consultation: ${error.message}`);
    }
  }

  static async getByUserId(userId) {
    try {
      return await InitialConsultations.findAll({
        where: { User_ID: userId },
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
          Init_Status: initStatus,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching consultations: ${error.message}`);
    }
  }

  static async getByInitTypeAndSubjectAndStatus(
    initType,
    initSubject,
    initStatus
  ) {
    try {
      return await InitialConsultations.findAll({
        where: {
          Init_Type: initType,
          Init_Subject: initSubject,
          Init_Status: initStatus,
        },
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
          Init_Status: initStatus,
        },
      });
    } catch (error) {
      throw new Error(`Error fetching consultations: ${error.message}`);
    }
  }

  static async createInitialConsultation(data, files, internalUser) {
    const userId = internalUser || getUserId();
    const userTimezone = 'America/Guayaquil'; // Define timezone
    const t = await sequelize.transaction();
    let userCreated = false;

    try {
      const evidenceFile = files?.evidenceFile || null;
      const healthDocument = files?.healthDocuments || null;

      // Verificar si el usuario externo existe, si no, crearlo
      let user = await User.findOne({
        where: { User_ID: data.User_ID },
        transaction: t,
      });
      if (!user) {
        user = await UserModel.create(
          {
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
          },
          { transaction: t }
        );
        console.log(
          "Buffer de documento de salud:",
          healthDocument
            ? healthDocument.buffer
            : "No hay archivo de documento de salud"
        );

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
      const internalUser = await InternalUser.findOne({
        where: { Internal_ID: userId },
        transaction: t,
      });
      if (!internalUser) {
        throw new Error(`El usuario interno con ID ${userId} no existe.`);
      }

      let saveInitDate = null;
      if (data.Init_Date && moment(data.Init_Date, 'YYYY-MM-DD', true).isValid()) {
          saveInitDate = moment.tz(data.Init_Date, 'YYYY-MM-DD', userTimezone).startOf('day').utc().toDate();
          console.log(`[Create] Saving Init_Date as UTC: ${saveInitDate.toISOString()}`); // Log the UTC date being saved
      } else {
          console.warn(`[Create] Invalid or missing Init_Date received: ${data.Init_Date}`);
          // Decide how to handle invalid/missing date - throw error or allow null?
          // For now, allowing null if input is invalid/missing
      }

      //CREACION DE CÓDIGO DE CONSULTA INICIAL
      // Obtener el último Init_Code ordenado descendentemente
      const lastRecord = await InitialConsultations.findOne({
        order: [["Init_Code", "DESC"]],
        transaction: t,
      });

      let lastNumber = 0;
      if (lastRecord && lastRecord.Init_Code) {
        const lastCode = lastRecord.Init_Code;
        const numberPart = lastCode.substring(3); // Extraer número después de "AT-"
        lastNumber = parseInt(numberPart, 10);
      }

      const newNumber = lastNumber + 1;
      const newCode = `AT-${String(newNumber).padStart(6, "0")}`;

      // Crear la consulta inicial
      const newConsultation = await InitialConsultations.create(
        {
          Init_Code: newCode,
          Internal_ID: userId,
          User_ID: data.User_ID,
          Init_ClientType: data.Init_ClientType,
          Init_Date: saveInitDate,
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
          Init_CaseStatus: data.Init_CaseStatus,
          Init_SocialWork: data.Init_SocialWork,
          Init_MandatorySW: data.Init_MandatorySW,
          Init_Type: data.Init_Type,
          Init_AlertNote: buildInitAlertNote({
            prefix: "No cumple perfil socio económico:",
            User_AcademicInstruction: data.User_AcademicInstruction,
            User_Profession: data.User_Profession,
            User_IncomeLevel: data.User_IncomeLevel,
            User_FamilyIncome: data.User_FamilyIncome,
            prefix2: "Solicita materia no atendida por el CJG:",
            Init_Subject: data.Init_Subject,
            prefix3: "Recide fuera del DMQ (Distrito Metropolitano de Quito):",
            User_City: data.User_City,
          }),
        },
        { transaction: t }
      );

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
      const newEvidence = await Evidence.create(
        {
          Internal_ID: userId,
          Init_Code: newConsultation.Init_Code,
          Evidence_Name: evidenceFile
            ? evidenceFile.originalname
            : "Sin Documento",
          Evidence_Document_Type: evidenceFile ? evidenceFile.mimetype : null,
          Evidence_URL: null,
          Evidence_Date: new Date(),
          Evidence_File: evidenceFile ? evidenceFile.buffer : null, // Archivo de evidencia
        },
        { transaction: t }
      );
      console.log(
        "Buffer de evidencia:",
        evidenceFile ? evidenceFile.buffer : "No hay archivo de evidencia"
      );

      // 🔹 Registrar en Audit la creación de la evidencia
      await AuditModel.registerAudit(
        userId,
        "INSERT",
        "Evidences",
        `El usuario interno ${userId} subió la evidencia ${newEvidence.Evidence_ID} para la consulta ${data.Init_Code}`
      );

// --- Lógica para crear el registro en SocialWork si corresponde ---
if (newConsultation.Init_SocialWork === true) {
    // Verificar si ya existe un registro en SocialWork para esta consulta
    const existingSocialWork = await SocialWork.findOne({
        where: { Init_Code: newConsultation.Init_Code },
        transaction: t
    });
    if (!existingSocialWork) {
        const currentDate = moment().format("YYYY-MM-DD");
        const todayStart = moment(currentDate).startOf("day").toDate();
        const todayEnd = moment(currentDate).endOf("day").toDate();
        // Contar los registros de hoy usando SW_EntryDate
        const countResult = await SocialWork.findAndCountAll({
            where: {
                SW_EntryDate: {
                    [Op.gte]: todayStart,
                    [Op.lte]: todayEnd,
                },
            },
            transaction: t,
            paranoid: false,
        });
        const count = countResult.count + 1;
        const swProcessNumber = `TS${currentDate.replace(/-/g, "")}-${String(count).padStart(5, "0")}`;
        await SocialWork.create(
            {
                SW_ProcessNumber: swProcessNumber,
                SW_EntryDate: new Date(),
                SW_Status: "Activo",
                Init_Code: newConsultation.Init_Code,
            },
            { transaction: t }
        );
        console.log(
            `✅ Se insertó un registro en SocialWork con SW_ProcessNumber: ${swProcessNumber} porque Init_SocialWork es true.`
        );
        await AuditModel.registerAudit(
            userId,
            "INSERT",
            "SocialWork",
            `El usuario interno ${userId} creó el registro de trabajo social ${swProcessNumber} para la consulta ${newConsultation.Init_Code}`,
            { transaction: t }
        );
    } else {
        console.log(`ℹ️ Ya existe un registro en SocialWork para la consulta ${newConsultation.Init_Code}. No se creó uno nuevo.`);
    }
}
// --- Fin de la lógica de SocialWork ---



      await t.commit();
      return {
        message: "Consulta inicial ",
        consultation: newConsultation,
        evidence: newEvidence,
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

  static async createNewConsultation(data, internalUser) {
    const internalId = internalUser || getUserId(); // Obtener el ID del usuario interno desde la sesión o el argumento
    const userTimezone = 'America/Guayaquil'; // Define timezone
    const t = await sequelize.transaction();
    try {
      let user = await User.findOne({
        where: { User_ID: data.User_ID },
        transaction: t,
      });
      if (!user) {
        throw new Error(`El usuario externo con ID ${data.User_ID} no existe.`);
      }

      // Verificar si el usuario interno existe
      const internalUser = await InternalUser.findOne({
        where: { Internal_ID: internalId },
        transaction: t,
      });
      if (!internalUser) {
        throw new Error(`El usuario interno con ID ${internalId} no existe.`);
      }

      let saveInitDate = null;
      if (data.Init_Date && moment(data.Init_Date, 'YYYY-MM-DD', true).isValid()) {
          saveInitDate = moment.tz(data.Init_Date, 'YYYY-MM-DD', userTimezone).startOf('day').utc().toDate();
          console.log(`[Create New] Saving Init_Date as UTC: ${saveInitDate.toISOString()}`); // Log the UTC date being saved
      } else {
          console.warn(`[Create New] Invalid or missing Init_Date received: ${data.Init_Date}`);
      }



      // Obtener el último Init_Code ordenado descendentemente
      const lastRecord = await InitialConsultations.findOne({
        order: [["Init_Code", "DESC"]],
        transaction: t,
      });

      let lastNumber = 0;
      if (lastRecord && lastRecord.Init_Code) {
        const lastCode = lastRecord.Init_Code;
        const numberPart = lastCode.substring(3); // Extraer número después de "AT-"
        lastNumber = parseInt(numberPart, 10);
      }

      const newNumber = lastNumber + 1;
      const newCode = `AT-${String(newNumber).padStart(6, "0")}`;

      const newConsultation = await InitialConsultations.create(
        {
          Init_Code: newCode,
          Internal_ID: internalId,
          User_ID: data.User_ID,
          Init_ClientType: data.Init_ClientType,
          Init_Date: saveInitDate,
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
          Init_CaseStatus: data.Init_CaseStatus,
          Init_SocialWork: data.Init_SocialWork,
          Init_MandatorySW: data.Init_MandatorySW,
          Init_Type: data.Init_Type,
          Init_AlertNote: buildInitAlertNote({
            prefix: "No cumple perfil socio económico:",
            User_AcademicInstruction: user.User_AcademicInstruction,
            User_Profession: user.User_Profession,
            User_IncomeLevel: user.User_IncomeLevel,
            User_FamilyIncome: user.User_FamilyIncome,
            prefix2: "Solicita materia no atendida por el CJG:",
            Init_Subject: data.Init_Subject,
            prefix3: "Recide fuera del DMQ (Distrito Metropolitano de Quito):",
            User_City: user.User_City,
          }),
        },
        { transaction: t }
      );

      // 🔹 Registrar en Audit que un usuario interno creó una consulta inicial
      await AuditModel.registerAudit(
        internalId,
        "INSERT",
        "Initial_Consultations",
        `El usuario interno ${internalId} creó una nueva consulta inicial ${newConsultation.Init_Code} para el usuario ${data.User_ID}`,
        { transaction: t }
      );

      // --- Lógica para crear el registro en SocialWork si corresponde ---
      if (newConsultation.Init_SocialWork === true) {
        // Verificar si ya existe un registro en SocialWork para esta consulta
        const existingSocialWork = await SocialWork.findOne({
          where: { Init_Code: newConsultation.Init_Code },
          transaction: t,
        });

        if (!existingSocialWork) {
          const currentDate = moment().format("YYYY-MM-DD");
          const todayStart = moment(currentDate).startOf("day").toDate();
          const todayEnd = moment(currentDate).endOf("day").toDate();

          // Contar los registros de hoy usando la columna SW_EntryDate
          const countResult = await SocialWork.findAndCountAll({
            where: {
              SW_EntryDate: {
                [Op.gte]: todayStart,
                [Op.lte]: todayEnd,
              },
            },
            transaction: t,
            paranoid: false,
          });
          const count = countResult.count + 1;

          const swProcessNumber = `TS${currentDate.replace(/-/g, "")}-${String(
            count
          ).padStart(5, "0")}`;

          await SocialWork.create(
            {
              SW_ProcessNumber: swProcessNumber,
              SW_EntryDate: new Date(),
              SW_Status: "Activo",
              Init_Code: newConsultation.Init_Code,
            },
            { transaction: t }
          );

          console.log(
            `✅ Se insertó un registro en SocialWork con SW_ProcessNumber: ${swProcessNumber} porque Init_SocialWork es true.`
          );
          await AuditModel.registerAudit(
            internalId,
            "INSERT",
            "SocialWork",
            `El usuario interno ${internalId} creó el registro de trabajo social ${swProcessNumber} para la consulta ${newConsultation.Init_Code}`,
            { transaction: t }
          );
        } else {
          console.log(
            `ℹ️ Ya existe un registro en SocialWork para la consulta ${newConsultation.Init_Code}. No se creó uno nuevo.`
          );
        }
      }
      // --- Fin de la lógica de SocialWork ---

      await t.commit();

      return newConsultation;
    } catch (error) {
      throw new Error(
        `Error creating new initial consultation: ${error.message}`
      );
    }
  }

  static async update(id, data, internalUser) {
    const t = await sequelize.transaction();
    try {
      const consultation = await InitialConsultations.findOne({
        where: { Init_Code: id },
        transaction: t,
      });

      if (!consultation) {
        await t.rollback();
        return null;
      }

      const originalSocialWorkStatus = consultation.Init_SocialWork;
      const internalId = internalUser || getUserId();

      const [rowsUpdated] = await InitialConsultations.update(data, {
        where: { Init_Code: id },
        transaction: t,
      });

      if (rowsUpdated === 0) {
        await t.rollback();
        console.log(
          `No se actualizaron filas para la consulta ${id}. Los datos podrían ser los mismos.`
        );
        return consultation;
      }

      await AuditModel.registerAudit(
        internalId,
        "UPDATE",
        "Initial_Consultations",
        `El usuario interno ${internalId} actualizó la consulta inicial ${id}`,
        { transaction: t }
      );

      if (data.Init_SocialWork === true && !originalSocialWorkStatus) {
        const existingSocialWork = await SocialWork.findOne({
          where: { Init_Code: id },
          transaction: t,
        });

        if (!existingSocialWork) {
          const currentDate = moment().format("YYYY-MM-DD");
          const todayStart = moment(currentDate).startOf("day").toDate();
          const todayEnd = moment(currentDate).endOf("day").toDate();

          // --- Cambio aquí: Usar SW_EntryDate para contar ---
          const countResult = await SocialWork.findAndCountAll({
            where: {
              SW_EntryDate: {
                // <--- Usar SW_EntryDate
                [Op.gte]: todayStart,
                [Op.lte]: todayEnd,
              },
            },
            transaction: t,
            paranoid: false,
          });
          const count = countResult.count + 1;

          const swProcessNumber = `TS${currentDate.replace(/-/g, "")}-${String(
            count
          ).padStart(5, "0")}`;

          // --- Cambio aquí: Añadir SW_EntryDate al crear ---
          await SocialWork.create(
            {
              SW_ProcessNumber: swProcessNumber,
              SW_EntryDate: new Date(),
              SW_Status: "Activo",
              Init_Code: id,
            },
            { transaction: t }
          );

          console.log(
            `✅ Se insertó un registro en SocialWork con SW_ProcessNumber: ${swProcessNumber} porque Init_SocialWork cambió a true.`
          );
          await AuditModel.registerAudit(
            internalId,
            "INSERT",
            "SocialWork",
            `El usuario interno ${internalId} creó el registro de trabajo social ${swProcessNumber} para la consulta ${id}`,
            { transaction: t }
          );
        } else {
          console.log(
            `ℹ️ Ya existe un registro en SocialWork para la consulta ${id}. No se creó uno nuevo.`
          );
        }
      }

      await t.commit();
      const finalConsultation = await this.getById(id);
      return finalConsultation;
    } catch (error) {
      await t.rollback();
      console.error("Error en update InitialConsultationsModel:", error);
      throw new Error(`Error updating initial consultation: ${error.message}`);
    }
  }

  static async delete(id, internalUser) {
    try {
      const consultation = await this.getById(id);
      if (!consultation) return null;

      const internalId = internalUser || getUserId();
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
        attributes: [
          "User_FirstName",
          "User_LastName",
          "User_Age",
          "User_Phone",
        ],
      });

      if (!userData) {
        throw new Error("No se encontraron datos del usuario.");
      }

      console.log("Datos del usuario:", userData);

      // Limpiar etiquetas HTML del campo Init_Notes
      const cleanNotes = data.Init_Notes.replace(/&nbsp;/g, " ")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .trim();

      // Cargar la plantilla PDF
      const templatePath = "./src/docs/FICHA DE ATENCION.pdf"; // Asegúrate de que la ruta sea correcta
      const templateBytes = fs.readFileSync(templatePath);

      // Crear un nuevo documento PDF basado en la plantilla
      const pdfDoc = await PDFDocument.load(templateBytes);

      // Registrar fontkit antes de usarlo
      pdfDoc.registerFontkit(fontkit);

      // Cargar la fuente Aptos
      const AptosBytes = fs.readFileSync("./src/docs/Aptos.ttf"); // Asegúrate de que la ruta sea correcta
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

      firstPage.drawText(
        `${userData.User_FirstName} ${userData.User_LastName}`,
        {
          x: 123,
          y: 632,
          size: fontSize,
          font: AptosFont,
        }
      );

      firstPage.drawText(
        `${
          data.Init_Date ? new Date(data.Init_Date).toLocaleDateString() : ""
        }`,
        {
          x: 397,
          y: 655,
          size: fontSize,
          font: AptosFont,
        }
      );

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

      firstPage.drawText(
        `${userData.User_FirstName} ${userData.User_LastName}`,
        {
          x: 92,
          y: 194.5,
          size: 10,
          font: AptosFont,
        }
      );
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

  // static async generateExcelReport(startDate, endDate) {
  //   try {
  //       const consultations = await InitialConsultations.findAll({
  //           where: {
  //               Init_Date: {
  //                   [Op.between]: [startDate, endDate]
  //               }
  //           },
  //           include: [{
  //               model: User,
  //               attributes: { exclude: ['User_HealthDocuments'] } // Excluye BLOB de Usuario
  //           },
  //           { // <-- Add this include block
  //             model: InternalUser,
  //             attributes: ['Internal_Name', 'Internal_LastName'] // Select only names
  //         }
  //       ],
  //           attributes: { exclude: ['Init_AttentionSheet'] }, // Excluye BLOB de Consulta
  //           order: [['Init_Date', 'ASC']] // Opcional: ordenar por fecha
  //       });

  //       const workbook = new ExcelJS.Workbook();
  //       workbook.creator = 'Sistema Consultorios';
  //       workbook.lastModifiedBy = 'Sistema Consultorios';
  //       workbook.created = new Date();
  //       workbook.modified = new Date();

  //       const worksheet = workbook.addWorksheet('Reporte Consultas Iniciales');

  //       // --- Definir Cabeceras ---
  //       worksheet.columns = [
  //           // Datos Personales
  //           { header: 'Tipo ID', key: 'User_ID_Type', width: 15 },
  //           { header: 'Número ID', key: 'User_ID', width: 15 },
  //           { header: 'Nombres', key: 'User_FirstName', width: 25 },
  //           { header: 'Apellidos', key: 'User_LastName', width: 25 },
  //           { header: 'Edad', key: 'User_Age', width: 15 },
  //           { header: 'Género', key: 'User_Gender', width: 15 },
  //           { header: 'Fecha Nacimiento', key: 'User_BirthDate', width: 25, style: { numFmt: 'dd/mm/yyyy' } },
  //           { header: 'Nacionalidad', key: 'User_Nationality', width: 25 },
  //           { header: 'Etnia', key: 'User_Ethnicity', width: 15 },
  //           { header: 'Provincia', key: 'User_Province', width: 15 },
  //           { header: 'Ciudad', key: 'User_City', width: 30 },
  //           // Contacto
  //           { header: 'Teléfono', key: 'User_Phone', width: 15 },
  //           { header: 'Correo Electrónico', key: 'User_Email', width: 30 },
  //           { header: 'Dirección', key: 'User_Address', width: 40 },
  //           { header: 'Sector', key: 'User_Sector', width: 25 },
  //           { header: 'Zona', key: 'User_Zone', width: 10 },
  //           { header: 'Relación de Referencia', key: 'User_ReferenceRelationship', width: 30 },
  //           { header: 'Nombre de Referencia', key: 'User_ReferenceName', width: 25 },
  //           { header: 'Teléfono de Referencia', key: 'User_ReferencePhone', width: 25 },
  //           // Datos Demográficos y Socioeconómicos
  //           { header: 'Recibe Bono', key: 'User_SocialBenefit', width: 20 },
  //           { header: 'Dependiente Económico', key: 'User_EconomicDependence', width: 28 },
  //           { header: 'Instrucción Académica', key: 'User_AcademicInstruction', width: 25 },
  //           { header: 'Ocupación', key: 'User_Profession', width: 20 },
  //           { header: 'Estado Civil', key: 'User_MaritalStatus', width: 20 },
  //           { header: 'Dependientes', key: 'User_Dependents', width: 20 },
  //           { header: 'Nivel Ingresos', key: 'User_IncomeLevel', width: 15 },
  //           { header: 'Ingresos Familiares', key: 'User_FamilyIncome', width: 25 },
  //           { header: 'Grupo Familiar', key: 'User_FamilyGroup', width: 30 }, // JSON
  //           { header: 'Personas Econ. Activas', key: 'User_EconomicActivePeople', width: 25 },
  //           { header: 'Bienes Propios', key: 'User_OwnAssets', width: 30 }, // JSON
  //           { header: 'Tipo Vivienda', key: 'User_HousingType', width: 15 },
  //           { header: 'Pensionista', key: 'User_Pensioner', width: 15 },
  //           { header: 'Seguro de Salud', key: 'User_HealthInsurance', width: 20 },
  //           { header: 'Situación de Vulnerabilidad', key: 'User_VulnerableSituation', width: 25 },
  //           { header: 'Documentos Respaldo', key: 'User_SupportingDocuments', width: 25 },
  //           // Salud
  //           { header: 'Discapacidad', key: 'User_Disability', width: 15 },
  //           { header: 'Porcentaje Discapacidad', key: 'User_DisabilityPercentage', width: 25 },
  //           { header: 'Enfermedad Catastrófica', key: 'User_CatastrophicIllness', width: 25 },
  //           { header: 'Nombre Doc. Salud', key: 'User_HealthDocumentsName', width: 30 },
  //           // Datos Consulta Inicial
  //           { header: 'Código Consulta', key: 'Init_Code', width: 15 },
  //           { header: 'Consultorio', key: 'Init_Office', width: 25 },
  //           { header: 'Creado Por', key: 'Internal_UserName', width: 15 },
  //           { header: 'Tipo Cliente', key: 'Init_ClientType', width: 20 },
  //           { header: 'Fecha Consulta', key: 'Init_Date', width: 15, style: { numFmt: 'dd/mm/yyyy' } },
  //           { header: 'Fecha Fin', key: 'Init_EndDate', width: 15, style: { numFmt: 'dd/mm/yyyy' } },
  //           { header: 'Servicio', key: 'Init_Service', width: 20 },
  //           { header: 'Estado del Caso', key: 'Init_CaseStatus', width: 25 },
  //           { header: 'Materia', key: 'Init_Subject', width: 30 },
  //           { header: 'Tema', key: 'Init_Topic', width: 30 },
  //           { header: 'Abogado Asignado', key: 'Init_Lawyer', width: 25 },
  //           { header: 'Derivado Por', key: 'Init_Referral', width: 20 },
  //           { header: 'Estado Interno', key: 'Init_Status', width: 25 },
  //           { header: 'Complejidad', key: 'Init_Complexity', width: 20 },
  //           { header: 'Observaciones', key: 'Init_Notes', width: 50 },
  //           { header: 'Trabajo Social', key: 'Init_SocialWork', width: 20 },
  //           { header: 'TS Obligatorio', key: 'Init_MandatorySW', width: 20 },
  //           { header: 'Nota Alerta', key: 'Init_AlertNote', width: 50 },
  //       ];

  //       const formatValue = (value, key) => {
  //         // Handle JSON Arrays specifically
  //         if (key === 'User_FamilyGroup' || key === 'User_OwnAssets') {
  //             try {
  //                 if (value && typeof value === 'string') { // Ensure it's a string before parsing
  //                     const parsedArray = JSON.parse(value);
  //                     if (Array.isArray(parsedArray)) {
  //                         const filtered = parsedArray.filter(item => item !== null && item !== '');
  //                         return filtered.length > 0 ? filtered.join(', ') : 'Ninguno';
  //                     }
  //                 } else if (Array.isArray(value)) { // Handle if it's already an array
  //                      const filtered = value.filter(item => item !== null && item !== '');
  //                      return filtered.length > 0 ? filtered.join(', ') : 'Ninguno';
  //                 }
  //             } catch (e) {
  //                 // If parsing fails or it's not a valid format, treat as regular value
  //                 console.warn(`Could not parse JSON for key ${key}:`, value);
  //             }
  //         }

  //         // Handle Booleans
  //         if (typeof value === 'boolean') {
  //             return value ? 'Si' : 'No';
  //         }

  //         // Handle Dates (keep them as Date objects for Excel formatting)
  //         if (value instanceof Date) {
  //             return value;
  //         }

  //         // Handle Null, Undefined, or Empty Strings
  //         if (value === null || value === undefined || value === '') {
  //             return 'Ninguno';
  //         }

  //         // Clean HTML tags from specific fields (if needed beyond initial cleaning)
  //          if (key === 'Init_Notes' || key === 'Init_AlertNote') {
  //              return String(value).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim() || 'Ninguno';
  //          }
  //                      // Handle Null/Undefined/Empty (except for the manually added Internal_UserName)
  //                      if (key !== 'Internal_UserName' && (value === null || value === undefined || value === '')) { return 'Ninguno'; }
  //                      // Handle the case where Internal_UserName might be null/empty if the lookup fails
  //                      if (key === 'Internal_UserName' && (value === null || value === undefined || value === '')) { return 'Desconocido'; }


  //         // Return other values as strings
  //         return String(value);
  //     };

  //     const rowsToAdd = await Promise.all(consultations.map(async (consultation) => {
  //       const user = consultation.User || {};
  //       const initData = consultation.dataValues || {};
  //       const userData = user.dataValues || {};

  //       // 2. Fetch InternalUser name for *this specific* consultation
  //       let internalUserName = 'Desconocido'; // Default value
  //       if (initData.Internal_ID) { // Check if Internal_ID exists
  //           try {
  //               const internalUser = await InternalUser.findOne({
  //                   where: { Internal_ID: initData.Internal_ID },
  //                   attributes: ['Internal_Name', 'Internal_LastName']
  //               });
  //               if (internalUser) {
  //                   internalUserName = `${internalUser.Internal_Name || ''} ${internalUser.Internal_LastName || ''}`.trim();
  //                   if (!internalUserName) internalUserName = 'Desconocido'; // Handle empty names
  //               }
  //           } catch (lookupError) {
  //               console.error(`Error looking up InternalUser for ID ${initData.Internal_ID}:`, lookupError);
  //               // Keep internalUserName as 'Desconocido'
  //           }
  //       }

  //       // Combine data for easier access
  //       const combinedData = { ...userData, ...initData };

  //       // Create the row object by formatting each value
  //       const rowData = {};
  //       worksheet.columns.forEach(column => {
  //           const key = column.key;
  //           let rawValue;

  //           if (key === 'Internal_UserName') {
  //               rawValue = internalUserName; // Use the fetched name
  //           } else {
  //               rawValue = combinedData[key];
  //           }
  //           rowData[key] = formatValue(rawValue, key); // Format the value
  //       });
  //       return rowData; // Return the processed row data
  //   }));

  //   // Add all processed rows to the worksheet
  //   rowsToAdd.forEach(rowData => {
  //       worksheet.addRow(rowData);
  //   });

  //       // --- Estilizar Cabecera ---
  //       // ... (existing styling) ...
  //       worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  //       worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00388E' } };
  //       worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };


  //       // --- Habilitar Filtros en TODA la Cabecera ---
  //       // Helper function to get Excel column name (A, B, ..., Z, AA, AB, ...)
  //       const getExcelColumnName = (colIndex) => {
  //           let name = '';
  //           let dividend = colIndex + 1; // 1-based index
  //           while (dividend > 0) {
  //               const modulo = (dividend - 1) % 26;
  //               name = String.fromCharCode(65 + modulo) + name;
  //               dividend = Math.floor((dividend - modulo) / 26);
  //           }
  //           return name;
  //       };

  //       // Calculate the name of the last column based on the number of columns defined
  //       const lastColIndex = worksheet.columns.length - 1;
  //       const lastColName = getExcelColumnName(lastColIndex);

  //       // Apply autoFilter to the entire header row range (Row 1)
  //       if (lastColName) { // Ensure we have a valid column name
  //            worksheet.autoFilter = `A1:${lastColName}1`;
  //       } else {
  //            console.warn("Could not determine last column name for autoFilter.");
  //            // Optionally apply to A1 only if calculation fails
  //            // worksheet.autoFilter = 'A1';
  //       }
  //       // --- End Filter Logic ---


  //       // --- Generar Buffer ---
  //       const buffer = await workbook.xlsx.writeBuffer();
  //       return buffer;

  //   } catch (error) {
  //       console.error("Error generando el reporte Excel:", error);
  //       throw new Error(`Error generando el reporte Excel: ${error.message}`);
  //   }
  // }
  static async generateExcelReport(startDate, endDate) {
    // --- DEBUG LOG 1: Log received dates ---
    console.log('[Excel Report] Received Dates:', { startDate, endDate });
    console.log('[Excel Report] Types:', { startType: typeof startDate, endType: typeof endDate });
    // Check if they are Date objects
    if (startDate instanceof Date && endDate instanceof Date) {
        console.log('[Excel Report] UTC Dates for Query:', { utcStart: startDate.toISOString(), utcEnd: endDate.toISOString() });
    } else {
        console.error('[Excel Report] Error: Received dates are not Date objects!');
        // Optionally throw an error or handle differently if dates aren't correct type
    }
    // --- End DEBUG LOG 1 ---

    try {
        const consultations = await InitialConsultations.findAll({
            where: {
                Init_Date: {
                    [Op.between]: [startDate, endDate] // Use the received Date objects
                }
            },
            include: [{
                model: User,
                attributes: { exclude: ['User_HealthDocuments'] }
            }],
            attributes: { exclude: ['Init_AttentionSheet'] },
            order: [['Init_Date', 'ASC']]
        });

        // --- DEBUG LOG 2: Log query result ---
        console.log(`[Excel Report] Found ${consultations.length} consultations for the date range.`);
        // --- End DEBUG LOG 2 ---

        // --- Handle Empty Results Gracefully ---
        if (consultations.length === 0) {
            console.log('[Excel Report] No consultations found. Generating empty report.');
            // You might want to return an empty buffer or a specific message/error
            // For now, we'll let it continue to generate an empty sheet
        }
        // --- End Handle Empty Results ---


        const workbook = new ExcelJS.Workbook();
        // ... (workbook setup) ...
        workbook.creator = 'Sistema Consultorios';
        workbook.lastModifiedBy = 'Sistema Consultorios';
        workbook.created = new Date();
        workbook.modified = new Date();

        const worksheet = workbook.addWorksheet('Reporte Consultas Iniciales');

        // --- Define Column Keys and Main Headers (Row 1) ---
        const columnsDefinition = [
            // ... (existing column definitions) ...
             // Datos Personales (Cols 1-11) -> A-K
             { header: 'Tipo ID', key: 'User_ID_Type', width: 15 },
             { header: 'Número ID', key: 'User_ID', width: 15 },
             { header: 'Nombres', key: 'User_FirstName', width: 25 },
             { header: 'Apellidos', key: 'User_LastName', width: 25 },
             { header: 'Edad', key: 'User_Age', width: 10 },
             { header: 'Género', key: 'User_Gender', width: 15 },
             { header: 'Fecha Nacimiento', key: 'User_BirthDate', width: 18, style: { numFmt: 'dd/mm/yyyy' } },
             { header: 'Nacionalidad', key: 'User_Nationality', width: 20 },
             { header: 'Etnia', key: 'User_Ethnicity', width: 15 },
             { header: 'Provincia', key: 'User_Province', width: 15 },
             { header: 'Ciudad', key: 'User_City', width: 20 },
             // Contacto (Cols 12-19) -> L-S
             { header: 'Teléfono', key: 'User_Phone', width: 15 },
             { header: 'Correo Electrónico', key: 'User_Email', width: 30 },
             { header: 'Dirección', key: 'User_Address', width: 40 },
             { header: 'Sector', key: 'User_Sector', width: 20 },
             { header: 'Zona', key: 'User_Zone', width: 12 },
             { header: 'Relación Ref.', key: 'User_ReferenceRelationship', width: 20 },
             { header: 'Nombre Ref.', key: 'User_ReferenceName', width: 25 },
             { header: 'Teléfono Ref.', key: 'User_ReferencePhone', width: 18 },
             // Datos Demográficos y Socioeconómicos (Cols 20-35) -> T-AI
             { header: 'Recibe Bono', key: 'User_SocialBenefit', width: 12 },
             { header: 'Dependiente Econ.', key: 'User_EconomicDependence', width: 15 },
             { header: 'Instrucción', key: 'User_AcademicInstruction', width: 25 },
             { header: 'Ocupación', key: 'User_Profession', width: 20 },
             { header: 'Estado Civil', key: 'User_MaritalStatus', width: 15 },
             { header: 'Dependientes', key: 'User_Dependents', width: 12 },
             { header: 'Nivel Ingresos', key: 'User_IncomeLevel', width: 15 },
             { header: 'Ingresos Fam.', key: 'User_FamilyIncome', width: 18 },
             { header: 'Grupo Familiar', key: 'User_FamilyGroup', width: 30 },
             { header: 'Pers. Econ. Activas', key: 'User_EconomicActivePeople', width: 15 },
             { header: 'Bienes Propios', key: 'User_OwnAssets', width: 30 },
             { header: 'Tipo Vivienda', key: 'User_HousingType', width: 15 },
             { header: 'Pensionista', key: 'User_Pensioner', width: 15 },
             { header: 'Seguro Salud', key: 'User_HealthInsurance', width: 20 },
             { header: 'Sit. Vulnerabilidad', key: 'User_VulnerableSituation', width: 25 },
             { header: 'Docs. Respaldo', key: 'User_SupportingDocuments', width: 25 },
             // Salud (Cols 36-39) -> AJ-AM
             { header: 'Discapacidad', key: 'User_Disability', width: 15 },
             { header: 'Porc. Discapacidad', key: 'User_DisabilityPercentage', width: 15 },
             { header: 'Enf. Catastrófica', key: 'User_CatastrophicIllness', width: 25 },
             { header: 'Nombre Doc. Salud', key: 'User_HealthDocumentsName', width: 30 },
             // Datos Consulta Inicial (Cols 40-58) -> AN-BF
             { header: 'Código Consulta', key: 'Init_Code', width: 18 },
             { header: 'Consultorio', key: 'Init_Office', width: 25 },
             { header: 'Creado Por', key: 'Internal_UserName', width: 30 },
             { header: 'Tipo Cliente', key: 'Init_ClientType', width: 20 },
             { header: 'Fecha Consulta', key: 'Init_Date', width: 18, style: { numFmt: 'dd/mm/yyyy' } },
             { header: 'Fecha Fin', key: 'Init_EndDate', width: 18, style: { numFmt: 'dd/mm/yyyy' } },
             { header: 'Servicio', key: 'Init_Service', width: 20 },
             { header: 'Estado Caso', key: 'Init_CaseStatus', width: 18 },
             { header: 'Materia', key: 'Init_Subject', width: 30 },
             { header: 'Tema', key: 'Init_Topic', width: 30 },
             { header: 'Abogado Asignado', key: 'Init_Lawyer', width: 25 },
             { header: 'Derivado Por', key: 'Init_Referral', width: 20 },
             { header: 'Estado Interno', key: 'Init_Status', width: 15 },
             { header: 'Complejidad', key: 'Init_Complexity', width: 15 },
             { header: 'Observaciones', key: 'Init_Notes', width: 50 },
             { header: 'Trabajo Social', key: 'Init_SocialWork', width: 15 },
             { header: 'TS Obligatorio', key: 'Init_MandatorySW', width: 15 },
             { header: 'Nota Alerta', key: 'Init_AlertNote', width: 50 },
        ];
        worksheet.columns = columnsDefinition;

        // --- Add Sub-Headers (Row 2) ---
        // ... (existing sub-header logic) ...
        worksheet.insertRow(2, []); // Insert a blank row at position 2
        const mergeRanges = { personal: 'A2:K2', contacto: 'L2:S2', socioEco: 'T2:AI2', salud: 'AJ2:AM2', consulta: 'AN2:BF2' };
        worksheet.mergeCells(mergeRanges.personal); worksheet.getCell('A2').value = 'DATOS PERSONALES DEL USUARIO';
        worksheet.mergeCells(mergeRanges.contacto); worksheet.getCell('L2').value = 'CONTACTO';
        worksheet.mergeCells(mergeRanges.socioEco); worksheet.getCell('T2').value = 'DATOS DEMOGRÁFICOS Y SOCIOECONÓMICOS';
        worksheet.mergeCells(mergeRanges.salud); worksheet.getCell('AJ2').value = 'SALUD';
        worksheet.mergeCells(mergeRanges.consulta); worksheet.getCell('AN2').value = 'DATOS CONSULTA INICIAL'; // Changed title back

        // --- Styling ---
        // ... (existing styling logic, including specific styles for consulta header/sub-header) ...
        const headerStyle = { font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00388E' } }, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } };
        const subHeaderStyleDefault = { font: { bold: true, color: { argb: 'FF000000' }, size: 10 }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }, alignment: { vertical: 'middle', horizontal: 'center' }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } };
        const headerStyleConsulta = { ...headerStyle, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF646665' } } }; // Dark Grey for Row 1 Consulta headers
        const subHeaderStyleConsulta = { ...subHeaderStyleDefault, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAEAEA' } } }; // Lighter Gray for Row 2 Consulta sub-header

        worksheet.getRow(1).eachCell({ includeEmpty: true }, cell => { cell.style = headerStyle; });
        worksheet.getRow(1).height = 30;
        worksheet.getRow(2).eachCell({ includeEmpty: true }, cell => { cell.style = subHeaderStyleDefault; });
        worksheet.getRow(2).height = 20;

        const consultaStartCol = 'AN'; const consultaEndCol = 'BF';
        const consultaStartColNum = worksheet.getColumn(consultaStartCol).number;
        const consultaEndColNum = worksheet.getColumn(consultaEndCol).number;
        // Apply specific styles to Row 1 (Main Header) for Consulta section
        for (let i = consultaStartColNum; i <= consultaEndColNum; i++) { worksheet.getCell(1, i).style = headerStyleConsulta; }
        // Apply specific styles to Row 2 (Sub Header) for Consulta section
        for (let i = consultaStartColNum; i <= consultaEndColNum; i++) { worksheet.getCell(2, i).style = subHeaderStyleConsulta; }
        worksheet.getCell('AN2').style = subHeaderStyleConsulta; // Ensure merged cell style


        // --- Helper Function for Data Formatting ---
        // ... (existing formatValue function) ...
        const formatValue = (value, key) => {
            if (key === 'User_FamilyGroup' || key === 'User_OwnAssets') {
                try {
                    if (value && typeof value === 'string') { const parsedArray = JSON.parse(value); if (Array.isArray(parsedArray)) { const filtered = parsedArray.filter(item => item !== null && item !== ''); return filtered.length > 0 ? filtered.join(', ') : 'Ninguno'; } }
                    else if (Array.isArray(value)) { const filtered = value.filter(item => item !== null && item !== ''); return filtered.length > 0 ? filtered.join(', ') : 'Ninguno'; }
                } catch (e) { console.warn(`Could not parse JSON for key ${key}:`, value); }
            }
            if (typeof value === 'boolean') { return value ? 'Si' : 'No'; }
            if (value instanceof Date) { return value; } // Keep as Date object for Excel
            if (key !== 'Internal_UserName' && (value === null || value === undefined || value === '')) { return 'Ninguno'; }
            if (key === 'Internal_UserName' && (value === null || value === undefined || value === '')) { return 'Desconocido'; }
            if (key === 'Init_Notes' || key === 'Init_AlertNote') { const cleaned = String(value).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim(); return cleaned || 'Ninguno'; }
            return String(value);
        };


        // --- Añadir Filas con Datos (using Promise.all and map) ---
        const rowsToAdd = await Promise.all(consultations.map(async (consultation) => {
            const user = consultation.User || {};
            const initData = consultation.dataValues || {};
            const userData = user.dataValues || {};

            let internalUserName = 'Desconocido';
            if (initData.Internal_ID) {
                try {
                    const internalUser = await InternalUser.findOne({
                        where: { Internal_ID: initData.Internal_ID },
                        attributes: ['Internal_Name', 'Internal_LastName']
                    });
                    if (internalUser) {
                        internalUserName = `${internalUser.Internal_Name || ''} ${internalUser.Internal_LastName || ''}`.trim();
                        if (!internalUserName) internalUserName = 'Desconocido';
                    }
                } catch (lookupError) { console.error(`[Excel Report] Error looking up InternalUser for ID ${initData.Internal_ID}:`, lookupError); }
            }

            const combinedData = { ...userData, ...initData };
            const rowData = {};
            columnsDefinition.forEach(column => {
                const key = column.key;
                let rawValue = (key === 'Internal_UserName') ? internalUserName : combinedData[key];
                rowData[key] = formatValue(rawValue, key);
            });
            return rowData;
        }));

        // Add data rows starting from Row 3
        rowsToAdd.forEach((rowData, index) => {
            const row = worksheet.addRow(rowData);
            if ((index + 3) % 2 === 0) {
                 row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
             }
        });


        // --- Habilitar Filtros en la Cabecera Principal (Row 1) ---
        // ... (existing filter logic) ...
        const getExcelColumnName = (colIndex) => { let name = ''; let dividend = colIndex + 1; while (dividend > 0) { const modulo = (dividend - 1) % 26; name = String.fromCharCode(65 + modulo) + name; dividend = Math.floor((dividend - modulo) / 26); } return name; };
        const lastColIndex = columnsDefinition.length - 1;
        const lastColName = getExcelColumnName(lastColIndex);
        if (lastColName) { worksheet.autoFilter = `A1:${lastColName}1`; }
        else { console.warn("[Excel Report] Could not determine last column name for autoFilter."); }


        // --- Generar Buffer ---
        console.log('[Excel Report] Generating buffer...'); // DEBUG LOG 3
        const buffer = await workbook.xlsx.writeBuffer();
        console.log('[Excel Report] Buffer generated successfully.'); // DEBUG LOG 4
        return buffer;

    } catch (error) {
        // --- DEBUG LOG 5: Log any error during generation ---
        console.error("[Excel Report] Error during generation:", error);
        // --- End DEBUG LOG 5 ---
        // Re-throw the error so the controller can catch it
        throw new Error(`Error generando el reporte Excel: ${error.message}`);
    }
  }


}
