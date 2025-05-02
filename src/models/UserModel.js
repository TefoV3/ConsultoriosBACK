import { User } from "../schemas/User.js"; // Nombre traducido del esquema
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { AuditModel } from "../models/AuditModel.js";
import { sequelize } from "../database/database.js";
import { InitialConsultationsModel } from "./InitialConsultationsModel.js";
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


            // ✅ Registrar en Audit quién creó el usuario
            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "User",
                `El usuario interno ${internalId} creó al usuario ${newUser.User_ID}`, // Use newUser.User_ID
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
                // individualHooks: true // Consider if hooks are needed here or on the instance update below
            });

            // Optionally, if you need hooks to run reliably or need the instance updated:
            // await user.set(userDataToUpdate); // Apply changes to the instance
            // await user.save({ transaction: t, individualHooks: true }); // Save instance changes and run hooks

            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "User",
                `El usuario interno ${internalId} actualizó al usuario ${id}`,
                { transaction: t }
            );

            if (rowsUpdated === 0) {
                 // If no rows were updated (e.g., data was identical or user was deleted concurrently)
                 // We might still want to commit the audit log if that's desired.
                 // Or rollback if the update was expected to happen.
                 console.warn(`[User Update] No rows updated for User_ID: ${id}. Data might be identical or user deleted.`);
                 // Decide whether to commit or rollback based on requirements. Let's commit the audit for now.
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
    
            await User.update(
                { User_IsDeleted: true }, // Esto activa el hook
                { where: { User_ID: id, User_IsDeleted: false } }
            );

            await AuditModel.registerAudit(
                internalId, 
                "DELETE",
                "User",
                `El usuario interno ${internalId} eliminó lógicamente al usuario ${id}`
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
      
          // Asignar el buffer del archivo y el nombre personalizado
          user.User_HealthDocuments = file.buffer;
          user.User_HealthDocumentsName = documentName;

          //Verificamos que el espacio del archivo no supere el límite de 5MB
            const fileSizeInMB = file.buffer.length / (1024 * 1024); // Convertir a MB
            if (fileSizeInMB > 2) {
                console.error("El tamaño del archivo excede el límite de 2MB.");
                return res.status(401).json({ message: 'El archivo supera el límite de los 2MB' });
            }
      
          // Actualizar la base de datos con el nuevo archivo y nombre
          await user.update({
            User_HealthDocuments: file.buffer,
            User_HealthDocumentsName: documentName,
          });
      
          await AuditModel.registerAudit(
            internalId,
            "UPDATE",
            "User",
            `El usuario interno ${internalId} subió un documento de salud para el usuario ${id}`
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

            // Eliminar el documento de salud del usuario
            user.User_HealthDocuments = null; // O la ruta que corresponda para eliminar el archivo
            user.User_HealthDocumentsName = null; // Limpiar el nombre del archivo
            await user.save();

            await AuditModel.registerAudit(
                internalId, 
                "DELETE",
                "User",
                `El usuario interno ${internalId} eliminó el documento de salud del usuario ${id}`
            );

            return user;
        } catch (error) {
            throw new Error(`Error deleting document: ${error.message}`);
        }
    }
}
