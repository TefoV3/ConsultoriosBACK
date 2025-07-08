import { sequelize } from "../database/database.js";
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { User } from "../schemas/User.js";
import { InternalUser } from "../schemas/Internal_User.js";
import { AuditModel } from "../models/AuditModel.js";
import { UserModel } from "../models/UserModel.js";
import { Evidence } from "../schemas/Evidences.js";
import { getUserId } from "../sessionData.js";
import { PDFDocument } from "pdf-lib";
import { Social_Work } from "../schemas/Social_Work.js"; // Asegúrate de que la ruta sea correcta
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

  static async getAllWithDetails() {
    try {
      return await InitialConsultations.findAll({
        include: [
          {
            model: User,
            attributes: [
              "User_ID",
              "User_FirstName",
              "User_LastName"
            ],
          },
          {
            model: InternalUser,
            attributes: ["Internal_ID", "Internal_Name", "Internal_LastName"],
          },
        ],
        attributes: {
          exclude: ["Init_AttentionSheet"],
        },
      });
    } catch (error) {
      throw new Error(
        `Error retrieving initial consultations with details: ${error.message}`
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
        attributes: {
          exclude: ["Init_AttentionSheet"],
        },
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
            User_Disability: data.User_Disability,
            User_DisabilityPercentage: data.User_DisabilityPercentage,
            User_CatastrophicIllness: data.User_CatastrophicIllness,
            User_HealthDocuments: healthDocument ? healthDocument.buffer : null,
            User_HealthDocumentsName: data.User_HealthDocumentsName,
          },
          userId
        );
        console.log(
          "Buffer de documento de salud:",
          healthDocument
            ? healthDocument.buffer
            : "No hay archivo de documento de salud"
        );

        userCreated = true; // Marcar que el usuario fue creado en esta transacción
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
          console.log(`[Create New] Saving Init_Date as UTC: ${saveInitDate.toISOString()}`); // Log the UTC date being saved
      } else {
          console.warn(`[Create New] Invalid or missing Init_Date received: ${data.Init_Date}`);
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
      // Get admin user information for audit (reuse from above if user was created)
      let adminInfo = { name: 'Usuario Desconocido', area: 'Área no especificada' };
      try {
        const admin = await InternalUser.findOne({
          where: { Internal_ID: userId },
          attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"],
          transaction: t
        });
        
        if (admin) {
          adminInfo = {
            name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
            role: admin.Internal_Type || 'Rol no especificado', area: admin.Internal_Area || 'Área no especificada'
          };
        }
      } catch (err) {
        console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
      }

      // Get user information for audit (use the user variable that was already found/created)
      let userFullName = 'Usuario Desconocido';
      if (user && user.User_FirstName && user.User_LastName) {
        userFullName = `${user.User_FirstName} ${user.User_LastName}`;
      } else if (userCreated && data.User_FirstName && data.User_LastName) {
        // If user was just created in this transaction, use the data from input
        userFullName = `${data.User_FirstName} ${data.User_LastName}`;
      } else {
        // Fallback: try to fetch the user again if the user variable is null
        try {
          const externalUser = await User.findOne({
            where: { User_ID: data.User_ID },
            attributes: ["User_FirstName", "User_LastName"],
            transaction: t
          });
          
          if (externalUser) {
            userFullName = `${externalUser.User_FirstName} ${externalUser.User_LastName}`;
          }
        } catch (err) {
          console.warn("No se pudo obtener información del usuario externo para auditoría:", err.message);
        }
      }

      await AuditModel.registerAudit(
        userId,
        "INSERT",
        "Initial_Consultations",
        `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó la consulta inicial ${newConsultation.Init_Code} para el usuario ${userFullName} (ID: ${data.User_ID}) - Materia: ${data.Init_Subject}, Tipo: ${data.Init_Type}, Estado: ${data.Init_Status}, Oficina: ${data.Init_Office}, Abogado: ${data.Init_Lawyer || 'Sin asignar'}`,
        { transaction: t }
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
      const evidenceName = evidenceFile ? evidenceFile.originalname : "Sin Documento";
      const evidenceType = evidenceFile ? evidenceFile.mimetype : 'Sin tipo';
      const evidenceSize = evidenceFile ? `${(evidenceFile.buffer.length / 1024).toFixed(2)} KB` : 'Sin archivo';

      await AuditModel.registerAudit(
        userId,
        "INSERT",
        "Evidences",
        `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó evidencia ID ${newEvidence.Evidence_ID} para la consulta ${newConsultation.Init_Code} del usuario ${userFullName} - Nombre archivo: "${evidenceName}", Tipo: ${evidenceType}, Tamaño: ${evidenceSize}`,
        { transaction: t }
      );

// --- Lógica para crear el registro en Social_Work si corresponde ---
if (newConsultation.Init_SocialWork === true) {
    // Verificar si ya existe un registro en Social_Work para esta consulta
    const existingSocialWork = await Social_Work.findOne({
        where: { Init_Code: newConsultation.Init_Code },
        transaction: t
    });
    if (!existingSocialWork) {
        const currentDate = moment().format("YYYY-MM-DD");
        const todayStart = moment(currentDate).startOf("day").toDate();
        const todayEnd = moment(currentDate).endOf("day").toDate();
        // Contar los registros de hoy usando SW_EntryDate
        const countResult = await Social_Work.findAndCountAll({
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
        await Social_Work.create(
            {
                SW_ProcessNumber: swProcessNumber,
                SW_EntryDate: new Date(),
                SW_Status: "Activo",
                Init_Code: newConsultation.Init_Code,
            },
            { transaction: t }
        );
        console.log(
            `✅ Se insertó un registro en Social_Work con SW_ProcessNumber: ${swProcessNumber} porque Init_SocialWork es true.`
        );
        await AuditModel.registerAudit(
            userId,
            "INSERT",
            "Social_Work",
            `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó el registro de trabajo social ${swProcessNumber} para la consulta ${newConsultation.Init_Code} del usuario ${userFullName} - Estado: Activo`,
            { transaction: t }
        );
    } else {
        console.log(`ℹ️ Ya existe un registro en Social_Work para la consulta ${newConsultation.Init_Code}. No se creó uno nuevo.`);
    }
}
// --- Fin de la lógica de Social_Work ---



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
          `${adminInfo.name || 'Usuario Desconocido'} (${adminInfo.area || 'Área no especificada'}) eliminó al usuario externo ${data.User_ID} debido a un error en la creación de la consulta inicial - Error: ${error.message}`
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
      // Get admin user information for audit
      let adminInfo = { name: 'Usuario Desconocido', area: 'Área no especificada' };
      try {
        const admin = await InternalUser.findOne({
          where: { Internal_ID: internalId },
          attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"],
          transaction: t
        });
        
        if (admin) {
          adminInfo = {
            name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
            role: admin.Internal_Type || 'Rol no especificado', area: admin.Internal_Area || 'Área no especificada'
          };
        }
      } catch (err) {
        console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
      }

      // Get external user full name for audit
      let userFullName = 'Usuario Desconocido';
      if (user && user.User_FirstName && user.User_LastName) {
        userFullName = `${user.User_FirstName} ${user.User_LastName}`;
      } else {
        // Fallback: try to fetch the user again
        try {
          const externalUser = await User.findOne({
            where: { User_ID: data.User_ID },
            attributes: ["User_FirstName", "User_LastName"],
            transaction: t
          });
          
          if (externalUser) {
            userFullName = `${externalUser.User_FirstName} ${externalUser.User_LastName}`;
          }
        } catch (err) {
          console.warn("No se pudo obtener información del usuario externo para auditoría:", err.message);
        }
      }

      await AuditModel.registerAudit(
        internalId,
        "INSERT",
        "Initial_Consultations",
        `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó nueva consulta inicial ${newConsultation.Init_Code} para el usuario ${userFullName} (ID: ${newConsultation.User_ID}) - Materia: ${data.Init_Subject}, Tipo: ${data.Init_Type}, Estado: ${data.Init_Status}, Oficina: ${data.Init_Office}, Abogado: ${data.Init_Lawyer || 'Sin asignar'}`,
        { transaction: t }
      );

      // --- Lógica para crear el registro en Social_Work si corresponde ---
      if (newConsultation.Init_SocialWork === true) {
        // Verificar si ya existe un registro en Social_Work para esta consulta
        const existingSocialWork = await Social_Work.findOne({
          where: { Init_Code: newConsultation.Init_Code },
          transaction: t,
        });

        if (!existingSocialWork) {
          const currentDate = moment().format("YYYY-MM-DD");
          const todayStart = moment(currentDate).startOf("day").toDate();
          const todayEnd = moment(currentDate).endOf("day").toDate();

          // Contar los registros de hoy usando la columna SW_EntryDate
          const countResult = await Social_Work.findAndCountAll({
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

          await Social_Work.create(
            {
              SW_ProcessNumber: swProcessNumber,
              SW_EntryDate: new Date(),
              SW_Status: "Activo",
              Init_Code: newConsultation.Init_Code,
            },
            { transaction: t }
          );

          console.log(
            `✅ Se insertó un registro en Social_Work con SW_ProcessNumber: ${swProcessNumber} porque Init_SocialWork es true.`
          );
          await AuditModel.registerAudit(
            internalId,
            "INSERT",
            "Social_Work",
            `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó el registro de trabajo social ${swProcessNumber} para la consulta ${newConsultation.Init_Code} del usuario ${userFullName} - Estado: Activo`,
            { transaction: t }
          );
        } else {
          console.log(
            `ℹ️ Ya existe un registro en Social_Work para la consulta ${newConsultation.Init_Code}. No se creó uno nuevo.`
          );
        }
      }
      // --- Fin de la lógica de Social_Work ---

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
    const userTimezone = 'America/Guayaquil'; // Define timezone
    try {
      const consultation = await InitialConsultations.findOne({
        where: { Init_Code: id },
        exclude: ["Init_Date"],
        transaction: t,
      });

      if (!consultation) {
        await t.rollback();
        return null;
      }

      // Asegurarse de que la fecha inicial no esté en los datos a actualizar
      if (data.hasOwnProperty('Init_Date')) {
        delete data.Init_Date;
    }

    // Si después de eliminar la fecha inicial, no quedan datos para actualizar, retornar la consulta sin cambios
    if (Object.keys(data).length === 0) {
        console.log("No hay datos para actualizar después de excluir la fecha inicial");
        return internalUser; 
    }

    let consultationDataToUpdate = { ...data }; // Create a copy to modify
    if (consultationDataToUpdate.hasOwnProperty('Init_EndDate')) { // Check if Init_EndDate is part of the update
        if (consultationDataToUpdate.Init_EndDate && moment(consultationDataToUpdate.Init_EndDate, 'YYYY-MM-DD', true).isValid()) {
            consultationDataToUpdate.Init_EndDate = moment.tz(consultationDataToUpdate.Init_EndDate, 'YYYY-MM-DD', userTimezone).startOf('day').utc().toDate();
            console.log(`[User Update] Corrected Init_EndDate to UTC: ${consultationDataToUpdate.Init_EndDate.toISOString()}`);
        } else {
            console.warn(`[User Update] Invalid or null Init_EndDate received: ${consultationDataToUpdate.Init_EndDate}. Setting to null.`);
            consultationDataToUpdate.Init_EndDate = null; // Set to null if invalid/null received
        }
    }


      const originalSocialWorkStatus = consultation.Init_SocialWork;
      const internalId = internalUser || getUserId();

      // Store original values for audit comparison (all InitialConsultations schema attributes)
      const originalValues = {
        Init_ClientType: consultation.Init_ClientType,
        Init_Subject: consultation.Init_Subject,
        Init_Lawyer: consultation.Init_Lawyer,
        Init_Date: consultation.Init_Date,
        Init_EndDate: consultation.Init_EndDate,
        Init_Office: consultation.Init_Office,
        Init_Topic: consultation.Init_Topic,
        Init_Service: consultation.Init_Service,
        Init_Referral: consultation.Init_Referral,
        Init_Status: consultation.Init_Status,
        Init_CaseStatus: consultation.Init_CaseStatus,
        Init_Notes: consultation.Init_Notes,
        Init_Complexity: consultation.Init_Complexity,
        Init_Type: consultation.Init_Type,
        Init_SocialWork: consultation.Init_SocialWork,
        Init_MandatorySW: consultation.Init_MandatorySW,
        Init_AlertNote: consultation.Init_AlertNote,
        Init_EndCaseReason: consultation.Init_EndCaseReason,
        Init_EndCaseDescription: consultation.Init_EndCaseDescription
      };

      const [rowsUpdated] = await InitialConsultations.update(consultationDataToUpdate, {
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

      // Get admin user information for audit
      let adminInfo = { name: 'Usuario Desconocido', area: 'Área no especificada' };
      try {
        const admin = await InternalUser.findOne({
          where: { Internal_ID: internalId },
          attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"],
          transaction: t
        });
        
        if (admin) {
          adminInfo = {
            name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
            role: admin.Internal_Type || 'Rol no especificado', area: admin.Internal_Area || 'Área no especificada'
          };
        }
      } catch (err) {
        console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
      }

      // Get external user full name for audit
      let userFullName = 'Usuario Desconocido';
      try {
        const externalUser = await User.findOne({
          where: { User_ID: consultation.User_ID },
          attributes: ["User_FirstName", "User_LastName"],
          transaction: t
        });
        
        if (externalUser) {
          userFullName = `${externalUser.User_FirstName} ${externalUser.User_LastName}`;
        }
      } catch (err) {
        console.warn("No se pudo obtener información del usuario externo para auditoría:", err.message);
      }

      // Build change description - only include fields that actually changed
      let changeDetails = [];
      
      if (consultationDataToUpdate.hasOwnProperty('Init_Subject') && consultationDataToUpdate.Init_Subject !== originalValues.Init_Subject) {
        changeDetails.push(`Materia: "${originalValues.Init_Subject}" → "${consultationDataToUpdate.Init_Subject}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_Type') && consultationDataToUpdate.Init_Type !== originalValues.Init_Type) {
        changeDetails.push(`Tipo: "${originalValues.Init_Type}" → "${consultationDataToUpdate.Init_Type}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_Status') && consultationDataToUpdate.Init_Status !== originalValues.Init_Status) {
        changeDetails.push(`Estado: "${originalValues.Init_Status}" → "${consultationDataToUpdate.Init_Status}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_CaseStatus') && consultationDataToUpdate.Init_CaseStatus !== originalValues.Init_CaseStatus) {
        changeDetails.push(`Estado de caso: "${originalValues.Init_CaseStatus}" → "${consultationDataToUpdate.Init_CaseStatus}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_Lawyer') && consultationDataToUpdate.Init_Lawyer !== originalValues.Init_Lawyer) {
        changeDetails.push(`Abogado: "${originalValues.Init_Lawyer || 'Sin asignar'}" → "${consultationDataToUpdate.Init_Lawyer}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_Office') && consultationDataToUpdate.Init_Office !== originalValues.Init_Office) {
        changeDetails.push(`Oficina: "${originalValues.Init_Office}" → "${consultationDataToUpdate.Init_Office}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_Complexity') && consultationDataToUpdate.Init_Complexity !== originalValues.Init_Complexity) {
        changeDetails.push(`Complejidad: "${originalValues.Init_Complexity}" → "${consultationDataToUpdate.Init_Complexity}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_SocialWork') && consultationDataToUpdate.Init_SocialWork !== originalValues.Init_SocialWork) {
        changeDetails.push(`Trabajo Social: ${originalValues.Init_SocialWork ? 'Sí' : 'No'} → ${consultationDataToUpdate.Init_SocialWork ? 'Sí' : 'No'}`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_ClientType') && consultationDataToUpdate.Init_ClientType !== originalValues.Init_ClientType) {
        changeDetails.push(`Tipo cliente: "${originalValues.Init_ClientType}" → "${consultationDataToUpdate.Init_ClientType}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_Topic') && consultationDataToUpdate.Init_Topic !== originalValues.Init_Topic) {
        changeDetails.push(`Tema: "${originalValues.Init_Topic}" → "${consultationDataToUpdate.Init_Topic}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_Service') && consultationDataToUpdate.Init_Service !== originalValues.Init_Service) {
        changeDetails.push(`Servicio: "${originalValues.Init_Service}" → "${consultationDataToUpdate.Init_Service}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_Referral') && consultationDataToUpdate.Init_Referral !== originalValues.Init_Referral) {
        changeDetails.push(`Derivado por: "${originalValues.Init_Referral}" → "${consultationDataToUpdate.Init_Referral}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_MandatorySW') && consultationDataToUpdate.Init_MandatorySW !== originalValues.Init_MandatorySW) {
        changeDetails.push(`TS Obligatorio: ${originalValues.Init_MandatorySW ? 'Sí' : 'No'} → ${consultationDataToUpdate.Init_MandatorySW ? 'Sí' : 'No'}`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_EndCaseReason') && consultationDataToUpdate.Init_EndCaseReason !== originalValues.Init_EndCaseReason) {
        changeDetails.push(`Razón fin caso: "${originalValues.Init_EndCaseReason || 'Sin razón'}" → "${consultationDataToUpdate.Init_EndCaseReason}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_EndCaseDescription') && consultationDataToUpdate.Init_EndCaseDescription !== originalValues.Init_EndCaseDescription) {
        changeDetails.push(`Descripción fin caso: "${originalValues.Init_EndCaseDescription || 'Sin descripción'}" → "${consultationDataToUpdate.Init_EndCaseDescription}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_Notes') && consultationDataToUpdate.Init_Notes !== originalValues.Init_Notes) {
        const oldNotes = originalValues.Init_Notes ? (originalValues.Init_Notes.length > 50 ? originalValues.Init_Notes.substring(0, 50) + '...' : originalValues.Init_Notes) : 'Sin notas';
        const newNotes = consultationDataToUpdate.Init_Notes.length > 50 ? consultationDataToUpdate.Init_Notes.substring(0, 50) + '...' : consultationDataToUpdate.Init_Notes;
        changeDetails.push(`Notas: "${oldNotes}" → "${newNotes}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_EndDate') && consultationDataToUpdate.Init_EndDate !== originalValues.Init_EndDate) {
        const oldDate = originalValues.Init_EndDate ? new Date(originalValues.Init_EndDate).toISOString().split('T')[0] : 'Sin fecha';
        const newDate = new Date(consultationDataToUpdate.Init_EndDate).toISOString().split('T')[0];
        changeDetails.push(`Fecha fin: "${oldDate}" → "${newDate}"`);
      }

      if (consultationDataToUpdate.hasOwnProperty('Init_AlertNote') && consultationDataToUpdate.Init_AlertNote !== originalValues.Init_AlertNote) {
        const oldAlert = originalValues.Init_AlertNote ? (originalValues.Init_AlertNote.length > 30 ? originalValues.Init_AlertNote.substring(0, 30) + '...' : originalValues.Init_AlertNote) : 'Sin alerta';
        const newAlert = consultationDataToUpdate.Init_AlertNote.length > 30 ? consultationDataToUpdate.Init_AlertNote.substring(0, 30) + '...' : consultationDataToUpdate.Init_AlertNote;
        changeDetails.push(`Nota alerta: "${oldAlert}" → "${newAlert}"`);
      }

      const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : '';

      await AuditModel.registerAudit(
        internalId,
        "UPDATE",
        "Initial_Consultations",
        `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la consulta inicial ${id} del usuario ${userFullName} (ID: ${consultation.User_ID})${changeDescription}`,
        { transaction: t }
      );

      if (data.Init_SocialWork === true && !originalSocialWorkStatus) {
        const existingSocialWork = await Social_Work.findOne({
          where: { Init_Code: id },
          transaction: t,
        });

        if (!existingSocialWork) {
          const currentDate = moment().format("YYYY-MM-DD");
          const todayStart = moment(currentDate).startOf("day").toDate();
          const todayEnd = moment(currentDate).endOf("day").toDate();

          // --- Cambio aquí: Usar SW_EntryDate para contar ---
          const countResult = await Social_Work.findAndCountAll({
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
          await Social_Work.create(
            {
              SW_ProcessNumber: swProcessNumber,
              SW_EntryDate: new Date(),
              SW_Status: "Activo",
              Init_Code: id,
            },
            { transaction: t }
          );

          console.log(
            `✅ Se insertó un registro en Social_Work con SW_ProcessNumber: ${swProcessNumber} porque Init_SocialWork cambió a true.`
          );
          await AuditModel.registerAudit(
            internalId,
            "INSERT",
            "Social_Work",
            `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó el registro de trabajo social ${swProcessNumber} para la consulta ${id} del usuario ${userFullName} - Estado: Activo (activado desde actualización de consulta)`,
            { transaction: t }
          );
        } else {
          console.log(
            `ℹ️ Ya existe un registro en Social_Work para la consulta ${id}. No se creó uno nuevo.`
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

      // Get admin user information for audit
      let adminInfo = { name: 'Usuario Desconocido', area: 'Área no especificada' };
      try {
        const admin = await InternalUser.findOne({
          where: { Internal_ID: internalId },
          attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
        });
        
        if (admin) {
          adminInfo = {
            name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
            role: admin.Internal_Type || 'Rol no especificado', area: admin.Internal_Area || 'Área no especificada'
          };
        }
      } catch (err) {
        console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
      }

      // Get external user full name for audit
      let userFullName = 'Usuario Desconocido';
      try {
        const externalUser = await User.findOne({
          where: { User_ID: consultation.User_ID },
          attributes: ["User_FirstName", "User_LastName"]
        });
        
        if (externalUser) {
          userFullName = `${externalUser.User_FirstName} ${externalUser.User_LastName}`;
        }
      } catch (err) {
        console.warn("No se pudo obtener información del usuario externo para auditoría:", err.message);
      }

      await InitialConsultations.destroy({ where: { Init_Code: id } });

      const consultationDate = consultation.Init_Date ? new Date(consultation.Init_Date).toLocaleDateString('es-ES') : 'Sin fecha';
      const consultationSubject = consultation.Init_Subject || 'Sin materia';
      const consultationType = consultation.Init_Type || 'Sin tipo';
      const consultationStatus = consultation.Init_Status || 'Sin estado';
      const consultationLawyer = consultation.Init_Lawyer || 'Sin abogado asignado';

      // 🔹 Registrar en Audit que un usuario interno eliminó una consulta inicial
      await AuditModel.registerAudit(
        internalId,
        "DELETE",
        "Initial_Consultations",
        `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó la consulta inicial ${id} del usuario ${userFullName} (ID: ${consultation.User_ID}) - Materia: ${consultationSubject}, Tipo: ${consultationType}, Estado: ${consultationStatus}, Abogado: ${consultationLawyer}, Fecha: ${consultationDate}`
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
          "User_IncomeLevel",
          "User_AcademicInstruction",
          "User_Profession",
          "User_VulnerableSituation"
        ],
      });

      // Función para limpiar y normalizar texto HTML
      const cleanHtmlText = (htmlText) => {
        if (!htmlText || typeof htmlText !== 'string') return '';
        
        return htmlText
          // Limpiar entidades HTML
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'")
          // Remover etiquetas HTML
          .replace(/<\/?[^>]+(>|$)/g, ' ')
          // Normalizar espacios
          .replace(/\s+/g, ' ')
          .replace(/\n/g, ' ')
          .trim();
      };

      // Función optimizada para dividir texto en líneas
      const wrapTextForPDF = (text, maxWidth, font, fontSize) => {
        const cleanText = cleanHtmlText(text);
        if (!cleanText) return [];
        
        const words = cleanText.split(' ').filter(word => word.length > 0);
        const lines = [];
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          
          try {
            const testWidth = font.widthOfTextAtSize(testLine, fontSize);
            
            if (testWidth <= maxWidth) {
              currentLine = testLine;
            } else {
              if (currentLine) {
                lines.push(currentLine);
                currentLine = word;
              } else {
                // Para palabras muy largas, intentar dividirlas
                if (word.length > 30) {
                  const chunks = [];
                  let chunk = '';
                  
                  for (const char of word) {
                    const testChunk = chunk + char;
                    const chunkWidth = font.widthOfTextAtSize(testChunk, fontSize);
                    
                    if (chunkWidth <= maxWidth) {
                      chunk = testChunk;
                    } else {
                      if (chunk) chunks.push(chunk);
                      chunk = char;
                    }
                  }
                  
                  if (chunk) chunks.push(chunk);
                  lines.push(...chunks.slice(0, -1));
                  currentLine = chunks[chunks.length - 1] || '';
                } else {
                  currentLine = word;
                }
              }
            }
          } catch (error) {
            console.warn('Error midiendo texto, usando estimación:', error.message);
            // Fallback usando estimación de caracteres
            const estimatedWidth = testLine.length * fontSize * 0.6;
            if (estimatedWidth <= maxWidth) {
              currentLine = testLine;
            } else {
              if (currentLine) lines.push(currentLine);
              currentLine = word;
            }
          }
        }
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        return lines;
      };

      // Validar datos del usuario
      if (!userData) {
        throw new Error("No se encontraron datos del usuario.");
      }

      // Cargar y configurar el PDF
      const templatePath = "./src/docs/FICHA DE ATENCION.pdf";
      const templateBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(templateBytes);
      
      // Registrar fontkit
      pdfDoc.registerFontkit(fontkit);

      // Cargar fuente con manejo de errores
      let font;
      try {
        const fontBytes = fs.readFileSync("./src/docs/Aptos.ttf");
        font = await pdfDoc.embedFont(fontBytes);
        console.log('Fuente Aptos cargada correctamente');
      } catch (error) {
        console.error('Error cargando fuente Aptos:', error.message);
        throw new Error('No se pudo cargar la fuente requerida para el PDF');
      }

      // Configuración general
      const userTimezone = 'America/Guayaquil'; 
      const formattedInitDate = data.Init_Date
        ? moment(data.Init_Date).tz(userTimezone).format('DD/MM/YYYY') 
        : "";

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const fontSize = 11;

      // Función helper para dibujar texto con validación
      const drawTextSafely = (text, options) => {
        const safeText = text ? String(text).trim() : '';
        if (safeText) {
          firstPage.drawText(safeText, { ...options, font });
        }
      };

      // COLUMNA 1 - Datos del usuario
      drawTextSafely(`${userData.User_FirstName} ${userData.User_LastName}`, {
        x: 156, y: 736, size: fontSize
      });
      
      drawTextSafely(data.User_ID, {
        x: 156, y: 715, size: fontSize
      });
      
      drawTextSafely(userData.User_Phone, {
        x: 156, y: 690, size: fontSize
      });
      
      drawTextSafely(data.Init_Subject, {
        x: 156, y: 660, size: fontSize
      });
      
      drawTextSafely(data.Init_Service, {
        x: 156, y: 620, size: fontSize
      });

      // COLUMNA 2 - Información adicional
      drawTextSafely(formattedInitDate, {
        x: 420, y: 736, size: fontSize
      });
      
      drawTextSafely(userData.User_Age, {
        x: 420, y: 715, size: fontSize
      });
      
      drawTextSafely(userData.User_IncomeLevel, {
        x: 420, y: 690, size: fontSize
      });
      
      drawTextSafely(userData.User_AcademicInstruction, {
        x: 420, y: 668, size: fontSize
      });
      
      drawTextSafely(userData.User_Profession, {
        x: 420, y: 646, size: fontSize
      });
      
      drawTextSafely(userData.User_VulnerableSituation, {
        x: 420, y: 620, size: fontSize
      });

      // NOTAS DE ATENCIÓN - Manejo avanzado de texto
      const notesLines = wrapTextForPDF(data.Init_Notes, 500, font, 9);
      const startY = 570;
      const lineHeight = 14;
      const maxLines = 15; // Límite de líneas visibles
      
      notesLines.slice(0, maxLines).forEach((line, index) => {
        firstPage.drawText(line, {
          x: 47,
          y: startY - (index * lineHeight),
          size: 9,
          font
        });
      });

      // Si hay más líneas de las que caben, mostrar indicador
      if (notesLines.length > maxLines) {
        firstPage.drawText('...', {
          x: 47,
          y: startY - (maxLines * lineHeight),
          size: 9,
          font
        });
      }

      // CONSENTIMIENTO INFORMADO
      drawTextSafely(`${userData.User_FirstName} ${userData.User_LastName}`, {
        x: 78, y: 460, size: 10.5
      });
      
      drawTextSafely(data.User_ID, {
        x: 78, y: 446, size: 10.5
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

        const worksheet = workbook.addWorksheet('Reporte Primeras Consultas');

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
             { header: 'Cargas Familiares', key: 'User_Dependents', width: 12 },
             { header: 'Nivel Ingresos', key: 'User_IncomeLevel', width: 15 },
             { header: 'Ingresos Familiares.', key: 'User_FamilyIncome', width: 18 },
             { header: 'Grupo Familiar', key: 'User_FamilyGroup', width: 30 },
             { header: 'Pers. Econ. Activas', key: 'User_EconomicActivePeople', width: 15 },
             { header: 'Bienes Propios', key: 'User_OwnAssets', width: 30 },
             { header: 'Tipo Vivienda', key: 'User_HousingType', width: 15 },
             { header: 'Pensionista', key: 'User_Pensioner', width: 15 },
             { header: 'Seguro Salud', key: 'User_HealthInsurance', width: 20 },
             { header: 'Sit. Vulnerabilidad', key: 'User_VulnerableSituation', width: 25 },
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
        const mergeRanges = { personal: 'A2:K2', contacto: 'L2:S2', socioEco: 'T2:AI2', salud: 'AJ2:AL2', consulta: 'AM2:BD2' };
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

        const consultaStartCol = 'AM'; const consultaEndCol = 'BD';
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
            
            // Apply alternating row colors
            if ((index + 3) % 2 === 0) {
                 row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
             }
             
             // Center align all cells in this row
             row.eachCell({ includeEmpty: true }, (cell) => {
                 cell.alignment = { 
                     vertical: 'middle', 
                     horizontal: 'center' 
                 };
                 // Add borders to each cell
                 cell.border = {
                     top: { style: 'thin' },
                     left: { style: 'thin' },
                     bottom: { style: 'thin' },
                     right: { style: 'thin' }
                 };
             });
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
