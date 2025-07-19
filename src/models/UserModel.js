import { User } from "../schemas/User.js"; // Nombre traducido del esquema
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { InternalUser } from "../schemas/Internal_User.js";
import { Profiles } from "../schemas/parameter_tables/Profiles.js";
import { AuditModel } from "../models/AuditModel.js";
import { sequelize } from "../database/database.js";
import { InitialConsultationsModel } from "./InitialConsultationsModel.js";
import { getUserId } from '../sessionData.js';
import moment from 'moment-timezone'; // Import moment-timezone

export class UserModel {

    static async getAll() {
        try {
            return await User.findAll({ 
                where: { User_IsDeleted: false },
                attributes: {
                    exclude: ['User_HealthDocuments']
                }
             });
        } catch (error) {
            throw new Error(`Error retrieving users: ${error.message}`);
        }
    }


        static async getUsersWithSocialWork() {
            try {
                const users = await User.findAll({
                    include: [
                        {
                            model: InitialConsultations,
                            attributes: ["Init_Code", "Init_SocialWork"],
                            where: { Init_SocialWork: true }
                        }
                    ]
                });
    
                return users;
            } catch (error) {
                throw new Error(`Error retrieving users with social work: ${error.message}`);
            }
        }

    static async getById(id) {
        try {
            return await User.findOne({
                where: { User_ID: id, User_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error retrieving user: ${error.message}`);
        }
    }

    static async getDocumentById(id) {
        try {
            return await User.findOne({
                attributes: ['User_HealthDocuments'],
                where: { User_ID: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving document: ${error.message}`);
        }
    }


    static async create(data, internalUser) {
        const t = await sequelize.transaction(); // Start transaction
        const userTimezone = 'America/Guayaquil'; // Define timezone
        try {
            const internalId = internalUser || getUserId();

            // --- Timezone Correction for User_BirthDate ---
            let saveBirthDate = null;
            if (data.User_BirthDate && moment(data.User_BirthDate, 'YYYY-MM-DD', true).isValid()) {
                saveBirthDate = moment.tz(data.User_BirthDate, 'YYYY-MM-DD', userTimezone).startOf('day').utc().toDate();
                console.log(`[User Create] Saving User_BirthDate as UTC: ${saveBirthDate.toISOString()}`);
            } else if (data.User_BirthDate) { // Log if invalid format received
                console.warn(`[User Create] Invalid User_BirthDate format received: ${data.User_BirthDate}. Saving as null.`);
            }
            // Update data object with the corrected date or null
            const userDataToCreate = { ...data, User_BirthDate: saveBirthDate };
            // --- End Timezone Correction ---

            // ✅ Crear usuario with corrected data
            const newUser = await User.create(userDataToCreate, { transaction: t });

            // Get admin user information for audit
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
              const admin = await InternalUser.findOne({
                where: { Internal_ID: internalId },
                attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"],
                transaction: t
              });
              
              if (admin) {
                adminInfo = {
                  name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                  role: admin.Internal_Type || 'Rol no especificado',
                  area: admin.Internal_Area || 'Área no especificada'
                };
              }
            } catch (err) {
              console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            // ✅ Registrar en Audit quién creó el usuario
            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "User",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó al usuario externo ${newUser.User_ID} - Nombre: ${newUser.User_FirstName} ${newUser.User_LastName}, Cédula: ${newUser.User_ID}, Ciudad: ${newUser.User_City}, Teléfono: ${newUser.User_Phone}, Email: ${newUser.User_Email}`,
                { transaction: t }
            );

            await t.commit(); // Commit transaction
            return newUser;
        } catch (error) {
            await t.rollback(); // Rollback on error
            console.error("Error en UserModel.create:", error); // Log the specific error
            // Check for unique constraint violation (example for User_ID)
             if (error.name === 'SequelizeUniqueConstraintError') {
                 throw new Error(`Error al crear usuario: Ya existe un usuario con la cédula/ID proporcionada.`);
             }
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    static async update(id, data, file, internalUser) {
        const t = await sequelize.transaction(); // Start transaction
        const userTimezone = 'America/Guayaquil'; // Define timezone
        try {
            const user = await User.findOne({ where: { User_ID: id, User_IsDeleted: false }, transaction: t }); // Find within transaction
            const internalId = internalUser || getUserId();
            if (!user) {
                await t.rollback(); // Rollback if user not found
                return null;
            }

            // Store original values for audit comparison (all User schema attributes)
            const originalValues = {
                User_ID_Type: user.User_ID_Type,
                User_Age: user.User_Age,
                User_FirstName: user.User_FirstName,
                User_LastName: user.User_LastName,
                User_Gender: user.User_Gender,
                User_BirthDate: user.User_BirthDate,
                User_Nationality: user.User_Nationality,
                User_Ethnicity: user.User_Ethnicity,
                User_Province: user.User_Province,
                User_City: user.User_City,
                User_Phone: user.User_Phone,
                User_Email: user.User_Email,
                User_Address: user.User_Address,
                User_Sector: user.User_Sector,
                User_Zone: user.User_Zone,
                User_ReferenceRelationship: user.User_ReferenceRelationship,
                User_ReferenceName: user.User_ReferenceName,
                User_ReferencePhone: user.User_ReferencePhone,
                User_SocialBenefit: user.User_SocialBenefit,
                User_EconomicDependence: user.User_EconomicDependence,
                User_AcademicInstruction: user.User_AcademicInstruction,
                User_Profession: user.User_Profession,
                User_MaritalStatus: user.User_MaritalStatus,
                User_Dependents: user.User_Dependents,
                User_IncomeLevel: user.User_IncomeLevel,
                User_FamilyIncome: user.User_FamilyIncome,
                User_FamilyGroup: user.User_FamilyGroup,
                User_EconomicActivePeople: user.User_EconomicActivePeople,
                User_OwnAssets: user.User_OwnAssets,
                User_HousingType: user.User_HousingType,
                User_Pensioner: user.User_Pensioner,
                User_HealthInsurance: user.User_HealthInsurance,
                User_VulnerableSituation: user.User_VulnerableSituation,
                User_Disability: user.User_Disability,
                User_DisabilityPercentage: user.User_DisabilityPercentage,
                User_CatastrophicIllness: user.User_CatastrophicIllness,
                User_HealthDocuments: user.User_HealthDocuments,
                User_HealthDocumentsName: user.User_HealthDocumentsName
            };

            // --- Timezone Correction for User_BirthDate if present in update data ---
             let userDataToUpdate = { ...data }; // Create a copy to modify
            if (userDataToUpdate.hasOwnProperty('User_BirthDate')) { // Check if User_BirthDate is part of the update
                if (userDataToUpdate.User_BirthDate && moment(userDataToUpdate.User_BirthDate, 'YYYY-MM-DD', true).isValid()) {
                    userDataToUpdate.User_BirthDate = moment.tz(userDataToUpdate.User_BirthDate, 'YYYY-MM-DD', userTimezone).startOf('day').utc().toDate();
                    console.log(`[User Update] Corrected User_BirthDate to UTC: ${userDataToUpdate.User_BirthDate.toISOString()}`);
                } else {
                    console.warn(`[User Update] Invalid or null User_BirthDate received: ${userDataToUpdate.User_BirthDate}. Setting to null.`);
                    userDataToUpdate.User_BirthDate = null; // Set to null if invalid/null received
                }
            }
            // --- End Timezone Correction ---

            // Use the modified userDataToUpdate object for the update
            const [rowsUpdated] = await User.update(userDataToUpdate, {
                where: { User_ID: id, User_IsDeleted: false },
                transaction: t,
            });

            // Get admin user information for audit
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
              const admin = await InternalUser.findOne({
                where: { Internal_ID: internalId },
                attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"],
                transaction: t
              });
              
              if (admin) {
                adminInfo = {
                  name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                  role: admin.Internal_Type || 'Rol no especificado',
                  area: admin.Internal_Area || 'Área no especificada'
                };
              }
            } catch (err) {
              console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            // Build change description - only include fields that actually changed
            let changeDetails = [];
            
            // Helper function to normalize values for comparison
            const normalizeValue = (value) => {
              if (value === null || value === undefined) return '';
              if (typeof value === 'string') return value.trim();
              return String(value);
            };
            
            // Helper function to compare values properly
            const hasActuallyChanged = (newVal, oldVal, isNumeric = false) => {
              if (isNumeric) {
                return Number(newVal || 0) !== Number(oldVal || 0);
              }
              return normalizeValue(newVal) !== normalizeValue(oldVal);
            };
            
            if (userDataToUpdate.hasOwnProperty('User_FirstName') && hasActuallyChanged(userDataToUpdate.User_FirstName, originalValues.User_FirstName)) {
              changeDetails.push(`Nombre: "${originalValues.User_FirstName || ''}" → "${userDataToUpdate.User_FirstName || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_LastName') && hasActuallyChanged(userDataToUpdate.User_LastName, originalValues.User_LastName)) {
              changeDetails.push(`Apellido: "${originalValues.User_LastName || ''}" → "${userDataToUpdate.User_LastName || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_Email') && hasActuallyChanged(userDataToUpdate.User_Email, originalValues.User_Email)) {
              changeDetails.push(`Email: "${originalValues.User_Email || ''}" → "${userDataToUpdate.User_Email || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_Phone') && hasActuallyChanged(userDataToUpdate.User_Phone, originalValues.User_Phone)) {
              changeDetails.push(`Teléfono: "${originalValues.User_Phone || ''}" → "${userDataToUpdate.User_Phone || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_City') && hasActuallyChanged(userDataToUpdate.User_City, originalValues.User_City)) {
              changeDetails.push(`Ciudad: "${originalValues.User_City || ''}" → "${userDataToUpdate.User_City || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_Address') && hasActuallyChanged(userDataToUpdate.User_Address, originalValues.User_Address)) {
              changeDetails.push(`Dirección: "${originalValues.User_Address || ''}" → "${userDataToUpdate.User_Address || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_Profession') && hasActuallyChanged(userDataToUpdate.User_Profession, originalValues.User_Profession)) {
              changeDetails.push(`Profesión: "${originalValues.User_Profession || ''}" → "${userDataToUpdate.User_Profession || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_MaritalStatus') && hasActuallyChanged(userDataToUpdate.User_MaritalStatus, originalValues.User_MaritalStatus)) {
              changeDetails.push(`Estado civil: "${originalValues.User_MaritalStatus || ''}" → "${userDataToUpdate.User_MaritalStatus || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_Age') && hasActuallyChanged(userDataToUpdate.User_Age, originalValues.User_Age, true)) {
              changeDetails.push(`Edad: "${originalValues.User_Age || 0}" → "${userDataToUpdate.User_Age}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_Gender') && hasActuallyChanged(userDataToUpdate.User_Gender, originalValues.User_Gender)) {
              changeDetails.push(`Género: "${originalValues.User_Gender || ''}" → "${userDataToUpdate.User_Gender || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_Nationality') && hasActuallyChanged(userDataToUpdate.User_Nationality, originalValues.User_Nationality)) {
              changeDetails.push(`Nacionalidad: "${originalValues.User_Nationality || ''}" → "${userDataToUpdate.User_Nationality || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_Ethnicity') && hasActuallyChanged(userDataToUpdate.User_Ethnicity, originalValues.User_Ethnicity)) {
              changeDetails.push(`Etnia: "${originalValues.User_Ethnicity || ''}" → "${userDataToUpdate.User_Ethnicity || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_Province') && hasActuallyChanged(userDataToUpdate.User_Province, originalValues.User_Province)) {
              changeDetails.push(`Provincia: "${originalValues.User_Province || ''}" → "${userDataToUpdate.User_Province || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_Sector') && hasActuallyChanged(userDataToUpdate.User_Sector, originalValues.User_Sector)) {
              changeDetails.push(`Sector: "${originalValues.User_Sector || ''}" → "${userDataToUpdate.User_Sector || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_Zone') && hasActuallyChanged(userDataToUpdate.User_Zone, originalValues.User_Zone)) {
              changeDetails.push(`Zona: "${originalValues.User_Zone || ''}" → "${userDataToUpdate.User_Zone || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_AcademicInstruction') && hasActuallyChanged(userDataToUpdate.User_AcademicInstruction, originalValues.User_AcademicInstruction)) {
              changeDetails.push(`Instrucción académica: "${originalValues.User_AcademicInstruction || ''}" → "${userDataToUpdate.User_AcademicInstruction || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_IncomeLevel') && hasActuallyChanged(userDataToUpdate.User_IncomeLevel, originalValues.User_IncomeLevel)) {
              changeDetails.push(`Nivel de ingresos: "${originalValues.User_IncomeLevel || ''}" → "${userDataToUpdate.User_IncomeLevel || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_FamilyIncome') && hasActuallyChanged(userDataToUpdate.User_FamilyIncome, originalValues.User_FamilyIncome)) {
              changeDetails.push(`Ingresos familiares: "${originalValues.User_FamilyIncome || ''}" → "${userDataToUpdate.User_FamilyIncome || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_Dependents') && hasActuallyChanged(userDataToUpdate.User_Dependents, originalValues.User_Dependents, true)) {
              changeDetails.push(`Dependientes: "${originalValues.User_Dependents || 0}" → "${userDataToUpdate.User_Dependents}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_HousingType') && hasActuallyChanged(userDataToUpdate.User_HousingType, originalValues.User_HousingType)) {
              changeDetails.push(`Tipo de vivienda: "${originalValues.User_HousingType || ''}" → "${userDataToUpdate.User_HousingType || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_Disability') && hasActuallyChanged(userDataToUpdate.User_Disability, originalValues.User_Disability)) {
              changeDetails.push(`Discapacidad: "${originalValues.User_Disability || ''}" → "${userDataToUpdate.User_Disability || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_DisabilityPercentage') && hasActuallyChanged(userDataToUpdate.User_DisabilityPercentage, originalValues.User_DisabilityPercentage, true)) {
              changeDetails.push(`Porcentaje discapacidad: "${originalValues.User_DisabilityPercentage || 0}%" → "${userDataToUpdate.User_DisabilityPercentage}%"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_VulnerableSituation') && hasActuallyChanged(userDataToUpdate.User_VulnerableSituation, originalValues.User_VulnerableSituation)) {
              changeDetails.push(`Situación vulnerable: "${originalValues.User_VulnerableSituation || ''}" → "${userDataToUpdate.User_VulnerableSituation || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_CatastrophicIllness') && hasActuallyChanged(userDataToUpdate.User_CatastrophicIllness, originalValues.User_CatastrophicIllness)) {
              changeDetails.push(`Enfermedad catastrófica: "${originalValues.User_CatastrophicIllness || ''}" → "${userDataToUpdate.User_CatastrophicIllness || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_ReferenceName') && hasActuallyChanged(userDataToUpdate.User_ReferenceName, originalValues.User_ReferenceName)) {
              changeDetails.push(`Nombre referencia: "${originalValues.User_ReferenceName || ''}" → "${userDataToUpdate.User_ReferenceName || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_ReferencePhone') && hasActuallyChanged(userDataToUpdate.User_ReferencePhone, originalValues.User_ReferencePhone)) {
              changeDetails.push(`Teléfono referencia: "${originalValues.User_ReferencePhone || ''}" → "${userDataToUpdate.User_ReferencePhone || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_ID_Type') && hasActuallyChanged(userDataToUpdate.User_ID_Type, originalValues.User_ID_Type)) {
              changeDetails.push(`Tipo ID: "${originalValues.User_ID_Type || ''}" → "${userDataToUpdate.User_ID_Type || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_BirthDate') && userDataToUpdate.User_BirthDate !== originalValues.User_BirthDate) {
              // Compare dates properly by converting both to same format
              const oldDateStr = originalValues.User_BirthDate ? new Date(originalValues.User_BirthDate).toISOString().split('T')[0] : 'Sin fecha';
              const newDateStr = new Date(userDataToUpdate.User_BirthDate).toISOString().split('T')[0];
              
              if (oldDateStr !== newDateStr) {
                changeDetails.push(`Fecha nacimiento: "${oldDateStr}" → "${newDateStr}"`);
              }
            }

            if (userDataToUpdate.hasOwnProperty('User_ReferenceRelationship') && hasActuallyChanged(userDataToUpdate.User_ReferenceRelationship, originalValues.User_ReferenceRelationship)) {
              changeDetails.push(`Relación referencia: "${originalValues.User_ReferenceRelationship || ''}" → "${userDataToUpdate.User_ReferenceRelationship || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_SocialBenefit') && userDataToUpdate.User_SocialBenefit !== originalValues.User_SocialBenefit) {
              changeDetails.push(`Beneficio social: "${originalValues.User_SocialBenefit ? 'Sí' : 'No'}" → "${userDataToUpdate.User_SocialBenefit ? 'Sí' : 'No'}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_EconomicDependence') && userDataToUpdate.User_EconomicDependence !== originalValues.User_EconomicDependence) {
              changeDetails.push(`Dependencia económica: "${originalValues.User_EconomicDependence ? 'Sí' : 'No'}" → "${userDataToUpdate.User_EconomicDependence ? 'Sí' : 'No'}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_FamilyGroup') && JSON.stringify(userDataToUpdate.User_FamilyGroup || []) !== JSON.stringify(originalValues.User_FamilyGroup || [])) {
              changeDetails.push(`Grupo familiar: modificado`);
            }

            if (userDataToUpdate.hasOwnProperty('User_EconomicActivePeople') && hasActuallyChanged(userDataToUpdate.User_EconomicActivePeople, originalValues.User_EconomicActivePeople, true)) {
              changeDetails.push(`Personas económicamente activas: "${originalValues.User_EconomicActivePeople || 0}" → "${userDataToUpdate.User_EconomicActivePeople}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_OwnAssets') && JSON.stringify(userDataToUpdate.User_OwnAssets || []) !== JSON.stringify(originalValues.User_OwnAssets || [])) {
              changeDetails.push(`Activos propios: modificado`);
            }

            if (userDataToUpdate.hasOwnProperty('User_Pensioner') && hasActuallyChanged(userDataToUpdate.User_Pensioner, originalValues.User_Pensioner)) {
              changeDetails.push(`Pensionista: "${originalValues.User_Pensioner || ''}" → "${userDataToUpdate.User_Pensioner || ''}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_HealthInsurance') && hasActuallyChanged(userDataToUpdate.User_HealthInsurance, originalValues.User_HealthInsurance)) {
              // Handle cases where values might be null/undefined
              const oldValue = originalValues.User_HealthInsurance || 'Sin seguro';
              const newValue = userDataToUpdate.User_HealthInsurance || 'Sin seguro';
              changeDetails.push(`Seguro salud: "${oldValue}" → "${newValue}"`);
            }

            if (userDataToUpdate.hasOwnProperty('User_HealthDocumentsName') && hasActuallyChanged(userDataToUpdate.User_HealthDocumentsName, originalValues.User_HealthDocumentsName)) {
              changeDetails.push(`Documento salud: "${originalValues.User_HealthDocumentsName || ''}" → "${userDataToUpdate.User_HealthDocumentsName || ''}"`);
            }

            const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : '';
            const userFullName = `${originalValues.User_FirstName} ${originalValues.User_LastName}`;

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "User",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó al usuario externo ${userFullName} (ID: ${id})${changeDescription}`,
                { transaction: t }
            );

            if (rowsUpdated === 0) {
                 console.warn(`[User Update] No rows updated for User_ID: ${id}. Data might be identical or user deleted.`);
            }

            await t.commit(); // Commit transaction

            // Fetch the potentially updated user outside the transaction to get the final state
            return await this.getById(id);

        } catch (error) {
            await t.rollback(); // Rollback on error
            console.error("Error en UserModel.update:", error); // Log the specific error
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    static async delete(id, internalUser) {
        try {
            
            if (!id) {
                throw new Error("The User_ID field is required to delete a user");
            }
            
            const internalId = internalUser || getUserId();
            const user = await this.getById(id);
            if (!user) return null;

            // Get admin user information for audit
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
              const admin = await InternalUser.findOne({
                where: { Internal_ID: internalId },
                attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
              });
              
              if (admin) {
                adminInfo = {
                  name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                  role: admin.Internal_Type || 'Rol no especificado',
                  area: admin.Internal_Area || 'Área no especificada'
                };
              }
            } catch (err) {
              console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }
    
            await User.update(
                { User_IsDeleted: true },
                { where: { User_ID: id, User_IsDeleted: false } }
            );

            const userFullName = `${user.User_FirstName} ${user.User_LastName}`;
            const userDetails = `Cédula: ${user.User_ID}, Ciudad: ${user.User_City}, Teléfono: ${user.User_Phone}, Email: ${user.User_Email}`;

            await AuditModel.registerAudit(
                internalId, 
                "DELETE",
                "User",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente al usuario externo ${userFullName} (ID: ${id}) - ${userDetails}, Estado anterior: Activo → Nuevo estado: Eliminado`
            );
    
            return user;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    static async uploadDocument(id, file, documentName, internalUser) {
        try {
            const internalId = internalUser || getUserId();
            const user = await this.getById(id);
            if (!user) {
              console.error("No se encontró el usuario con id:", id);
              return null;
            }
        
            console.log("Archivo recibido:", file);

            // Get admin user information for audit
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
              const admin = await InternalUser.findOne({
                where: { Internal_ID: internalId },
                attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
              });
              
              if (admin) {
                adminInfo = {
                  name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                  role: admin.Internal_Type || 'Rol no especificado',
                  area: admin.Internal_Area || 'Área no especificada'
                };
              }
            } catch (err) {
              console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            //Verificamos que el espacio del archivo no supere el límite de 2MB
            const fileSizeInMB = file.buffer.length / (1024 * 1024); // Convertir a MB
            if (fileSizeInMB > 2) {
                console.error("El tamaño del archivo excede el límite de 2MB.");
                throw new Error('El archivo supera el límite de los 2MB');
            }

            // Store previous document info for audit
            const previousDocumentStatus = user.User_HealthDocumentsName ? `Tenía documento: "${user.User_HealthDocumentsName}"` : 'No tenía documento previo';
        
            // Actualizar la base de datos con el nuevo archivo y nombre
            await user.update({
              User_HealthDocuments: file.buffer,
              User_HealthDocumentsName: documentName,
            });

            const userFullName = `${user.User_FirstName} ${user.User_LastName}`;
            const fileSize = `${fileSizeInMB.toFixed(2)} MB`;
        
            await AuditModel.registerAudit(
              internalId,
              "UPDATE",
              "User",
              `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) subió documento de salud para el usuario externo ${userFullName} (ID: ${id}) - ${previousDocumentStatus} → Nuevo documento: "${documentName}", Tamaño: ${fileSize}`
            );
            console.log("Usuario actualizado con el nuevo documento y auditoría registrada.");
        
            return user;
          } catch (error) {
            console.error("Error en UserModel.uploadDocument:", error.message);
            throw new Error(`Error uploading document: ${error.message}`);
          }
      }
      



    static async deleteDocument(id, internalUser) {
        try {
            const user = await this.getById(id);
            const internalId = internalUser || getUserId();
            if (!user) return null;

            // Get admin user information for audit
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
              const admin = await InternalUser.findOne({
                where: { Internal_ID: internalId },
                attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
              });
              
              if (admin) {
                adminInfo = {
                  name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                  role: admin.Internal_Type || 'Rol no especificado',
                  area: admin.Internal_Area || 'Área no especificada'
                };
              }
            } catch (err) {
              console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            // Store document info before deletion for audit
            const deletedDocumentName = user.User_HealthDocumentsName || 'Sin nombre';
            const userFullName = `${user.User_FirstName} ${user.User_LastName}`;

            // Eliminar el documento de salud del usuario
            user.User_HealthDocuments = null;
            user.User_HealthDocumentsName = null;
            await user.save();

            await AuditModel.registerAudit(
                internalId, 
                "UPDATE",
                "User",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó el documento de salud del usuario externo ${userFullName} (ID: ${id}) - Documento eliminado: "${deletedDocumentName}"`
            );

            return user;
        } catch (error) {
            throw new Error(`Error deleting document: ${error.message}`);
        }
    }
}
