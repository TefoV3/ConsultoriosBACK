import { User } from "../schemas/User.js"; // Nombre traducido del esquema
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { AuditModel } from "../models/AuditModel.js";

export class UserModel {

    static async getAll() {
        try {
            return await User.findAll({ where: { User_IsDeleted: false } });
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





    static async create(data, internalId) {
        try {
            // ✅ Crear usuario
            const newUser = await User.create(data);

            // ✅ Registrar en Audit quién creó el usuario
            await AuditModel.registerAudit(
                internalId, 
                "INSERT",
                "User",
                `El usuario interno ${internalId} creó al usuario ${data.User_ID}`
            );

            return newUser;
        } catch (error) {
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    static async update(id, data, internalId, file) {
        try {
            const user = await this.getById(id);
            if (!user) return null;

            const [rowsUpdated] = await User.update(data, {
                where: { User_ID: id, User_IsDeleted: false }
            });
            await user.update(data, { individualHooks: true });

            await AuditModel.registerAudit(
                internalId, 
                "UPDATE",
                "User",
                `El usuario interno ${internalId} actualizó al usuario ${id}`
            );

            if (rowsUpdated === 0) return null;
            return await this.getById(id);

        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            if (!id) {
                throw new Error("The User_ID field is required to delete a user");
            }
    
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

    // static async uploadDocument(id, file, internalId, documentName) {
    //     try {
    //       const user = await this.getById(id);
    //       if (!user) {
    //         console.error("No se encontró el usuario con id:", id);
    //         return null;
    //       }
      
    //       console.log("Archivo recibido:", file);
      
    //       // Asignar el buffer del archivo y el nombre personalizado
    //       user.User_HealthDocuments = file.buffer;
    //       user.User_HealthDocumentsName = documentName;

    //       //Verificamos que el espacio del archivo no supere el límite de 5MB
    //         const fileSizeInMB = file.buffer.length / (1024 * 1024); // Convertir a MB
    //         if (fileSizeInMB > 5) {
    //             console.error("El tamaño del archivo excede el límite de 5MB.");
    //             return res.status(401).json({ message: 'El archivo supera el límite de los 5MB' });
    //         }
      
    //       // Actualizar la base de datos con el nuevo archivo y nombre
    //       await user.update({
    //         User_HealthDocuments: file.buffer,
    //         User_HealthDocumentsName: documentName,
    //       });
      
    //       await AuditModel.registerAudit(
    //         internalId,
    //         "UPDATE",
    //         "User",
    //         `El usuario interno ${internalId} subió un documento de salud para el usuario ${id}`
    //       );
    //       console.log("Usuario actualizado con el nuevo documento y auditoría registrada.");
      
    //       return user;
    //     } catch (error) {
    //       console.error("Error en UserModel.uploadDocument:", error.message);
    //       throw new Error(`Error uploading document: ${error.message}`);
    //     }
    //   }

    static async uploadDocument(id, file, internalId, documentName) {
        try {
          const user = await this.getById(id);
          if (!user) {
            console.error("No se encontró el usuario con id:", id);
            return null;
          }
      
          console.log("Archivo recibido:", file);
      
          // Verificar tamaño del archivo
          const fileSizeInMB = file.buffer.length / (1024 * 1024);
          if (fileSizeInMB > 5) {
            console.error("El tamaño del archivo excede el límite de 5MB.");
            throw new Error("El archivo supera el límite de los 5MB.");
          }
      
          // Actualizar la base de datos con el archivo
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
      



    static async deleteDocument(id, internalId) {
        try {
            const user = await this.getById(id);
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
