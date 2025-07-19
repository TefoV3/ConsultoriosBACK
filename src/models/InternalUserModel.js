import { InternalUser } from "../schemas/Internal_User.js"; 
import { ResetPassword } from '../schemas/Reset_Password.js';
import { SECRET_JWT_KEY } from "../config.js";
import { SALT_ROUNDS } from '../config.js';
import { AuditModel } from "./AuditModel.js"; // Para registrar en auditoría
import { getUserId } from '../sessionData.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class InternalUserModel {

    //GET METHODS

    static async getAll() {
        try {
            return await InternalUser.findAll();
        } catch (error) {
            throw new Error(`Error retrieving internal users: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await InternalUser.findOne({
                where: { Internal_ID: id }
            });
        } catch (error) {
            console.log(error);
            throw new Error(`Error retrieving internal user: ${error.message}`);
        }
    }

    static async getByEmail(email) {
        try {
            return await InternalUser.findOne({
                where: { Internal_Email: email }
            });
        } catch (error) {
            throw new Error(`Error al obtener usuario interno: ${error.message}`);
        }
    }

    static async getAllActiveLawyers(area) {
        try {
            return await InternalUser.findAll({
                where: {
                    Internal_Type: 'Abogado',
                    Internal_Status: 1,
                    Internal_Area: area
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener abogados activos: ${error.message}`);
        }
    }

    static async getAllLawyers() {
        try {
            return await InternalUser.findAll({
                where: {
                    Internal_Type: 'Abogado',
                    Internal_Status: 'Activo'
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener abogados activos: ${error.message}`);
        }
    }




    static async getStudentsByArea(area) {
        try {
            return await InternalUser.findAll({
                where: {
                    Internal_Type: "Estudiante",
                    Internal_Area: area
                }
            });
        } catch (error) {
            throw new Error(`Error fetching students: ${error.message}`);
        }
    }

    static async getIdByNameAndLastName(firstName, lastName) {
        try {
            const user = await InternalUser.findOne({
                where: {
                    Internal_Name: firstName,
                    Internal_LastName: lastName
                },
                attributes: ['Internal_ID'] // Solo devuelve el ID
            });
    
            return user ? user.Internal_ID : null;
        } catch (error) {
            throw new Error(`Error fetching user ID by name and last name: ${error.message}`);
        }
    }

    
    

    //CREATE, UPDATE AND DELETE METHODS

    static async create(data, internalId) {
        try {
            const newRecord = await InternalUser.create(data);
            
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

            // Registrar en auditoría la creación
            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "InternalUser",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó nuevo usuario interno ID ${newRecord.Internal_ID} - Nombre: ${newRecord.Internal_Name} ${newRecord.Internal_LastName}, Email: ${newRecord.Internal_Email}, Tipo: ${newRecord.Internal_Type}, Área: ${newRecord.Internal_Area}, Estado: ${newRecord.Internal_Status}`
            );
            return newRecord;
            
        } catch (error) {
            console.log(`Error creating internal user: ${error.message}`);
            throw new Error(`Error creating internal user: ${error.message}`);
        }
    }

    static async bulkCreateUsers(data, internalUser, options = {}) {
        try {
          const internalId = internalUser || getUserId();
          const entries = Array.isArray(data) ? data : [data];
          if (entries.length === 0) {
            throw new Error("No hay usuarios para crear.");
          }
      
          const createdUsers = await InternalUser.bulkCreate(entries, options);

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

          // Registrar auditoría para la creación masiva
          const userDetails = createdUsers.map(user => 
            `${user.Internal_ID} (${user.Internal_Name} ${user.Internal_LastName} - ${user.Internal_Type})`
          ).join(', ');
          
          //Si es un solo usuario, el mensaje es singular, si son varios, es plural
          const action = createdUsers.length === 1 ? "creó al usuario interno" : "creó masivamente a los usuarios internos";
          
          // Registrar en auditoría la creación masiva
          await AuditModel.registerAudit(
              internalId,
              "INSERT",
              "InternalUser",
              `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) ${action}: ${userDetails} - Total: ${createdUsers.length} usuario(s)`
          );


      
          return createdUsers;
        } catch (error) {
          console.error(`Error en bulkCreateUsers: ${error.message}`);
          throw new Error(`Error al crear usuarios internos en bloque: ${error.message}`);
        }
      }
      

    static async update(id, data, internalID) {
        try {
            const internalUser = await this.getById(id);

            if (!internalUser) return null;

            // Store original values for audit comparison (all InternalUser schema attributes)
            const originalValues = {
                Internal_Name: internalUser.Internal_Name,
                Internal_LastName: internalUser.Internal_LastName,
                Internal_Email: internalUser.Internal_Email,
                Internal_Type: internalUser.Internal_Type,
                Profile_ID: internalUser.Profile_ID,
                Internal_Area: internalUser.Internal_Area,
                Internal_Phone: internalUser.Internal_Phone,
                Internal_Picture: internalUser.Internal_Picture,
                Internal_Status: internalUser.Internal_Status
            };

            // Asegurarse de que la contraseña no esté en los datos a actualizar
            if (data.hasOwnProperty('Internal_Password')) {
                delete data.Internal_Password;
            }

            // Si después de eliminar la contraseña, no quedan datos para actualizar, retornar el usuario actual
            if (Object.keys(data).length === 0) {
                console.log("No hay datos para actualizar después de excluir la contraseña.");
                return internalUser; 
            }

            const [rowsUpdated] = await InternalUser.update(data, {
                where: { Internal_ID: id },
            });

            if (rowsUpdated === 0) return null;

            // Get admin user information for audit
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
              const admin = await InternalUser.findOne({
                where: { Internal_ID: internalID },
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

            // Build change description - only include fields that actually changed
            let changeDetails = [];
            
            if (data.hasOwnProperty('Internal_Name') && data.Internal_Name !== originalValues.Internal_Name) {
              changeDetails.push(`Nombre: "${originalValues.Internal_Name}" → "${data.Internal_Name}"`);
            }

            if (data.hasOwnProperty('Internal_LastName') && data.Internal_LastName !== originalValues.Internal_LastName) {
              changeDetails.push(`Apellido: "${originalValues.Internal_LastName}" → "${data.Internal_LastName}"`);
            }

            if (data.hasOwnProperty('Internal_Email') && data.Internal_Email !== originalValues.Internal_Email) {
              changeDetails.push(`Email: "${originalValues.Internal_Email}" → "${data.Internal_Email}"`);
            }

            if (data.hasOwnProperty('Internal_Type') && data.Internal_Type !== originalValues.Internal_Type) {
              changeDetails.push(`Tipo: "${originalValues.Internal_Type}" → "${data.Internal_Type}"`);
            }

            if (data.hasOwnProperty('Internal_Area') && data.Internal_Area !== originalValues.Internal_Area) {
              changeDetails.push(`Área: "${originalValues.Internal_Area}" → "${data.Internal_Area}"`);
            }

            if (data.hasOwnProperty('Internal_Phone') && data.Internal_Phone !== originalValues.Internal_Phone) {
              changeDetails.push(`Teléfono: "${originalValues.Internal_Phone}" → "${data.Internal_Phone}"`);
            }

            if (data.hasOwnProperty('Internal_Status') && data.Internal_Status !== originalValues.Internal_Status) {
              changeDetails.push(`Estado: "${originalValues.Internal_Status}" → "${data.Internal_Status}"`);
            }

            if (data.hasOwnProperty('Profile_ID') && data.Profile_ID !== originalValues.Profile_ID) {
              changeDetails.push(`Perfil ID: "${originalValues.Profile_ID}" → "${data.Profile_ID}"`);
            }

            if (data.hasOwnProperty('Internal_Picture') && data.Internal_Picture !== originalValues.Internal_Picture) {
              changeDetails.push(`Imagen perfil: "${originalValues.Internal_Picture || 'Sin imagen'}" → "${data.Internal_Picture}"`);
            }

            const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : '';
            const targetUserName = `${originalValues.Internal_Name} ${originalValues.Internal_LastName}`;

            // Registrar en auditoría la actualización
            await AuditModel.registerAudit(
                internalID,
                "UPDATE",
                "InternalUser",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó al usuario interno ${targetUserName} (ID: ${id})${changeDescription}`
            );

            return await this.getById(id);
        } catch (error) {
            console.log(error);
            throw new Error(`Error updating internal user: ${error.message}`);
        }
    }

    static async updateResendCredentials(id, newEmail, newPlainPassword) {
        try {
            const user = await this.getById(id);
            if (!user) return null;
    
            const hashedPassword = await bcrypt.hash(newPlainPassword, SALT_ROUNDS);
    
            const [rowsUpdated] = await InternalUser.update(
                {
                    Internal_Email: newEmail,
                    Internal_Password: hashedPassword
                },
                {
                    where: { Internal_ID: id }
                }
            );
    
            return rowsUpdated > 0 ? await this.getById(id) : null;
        } catch (error) {
            console.error("Error en updateResendCredentials:", error);
            throw new Error("Error actualizando correo y contraseña");
        }
    }
    

    static async delete(id, internalUserID) {
        try {
            const internalId = internalUserID || getUserId();
            const internalUser = await this.getById(id);
            
            if (!internalUser) return null;

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

            await InternalUser.update(
                { Internal_Status: "Inactivo" },
                { where: { Internal_ID: id } }
            );

            const deletedUserName = `${internalUser.Internal_Name} ${internalUser.Internal_LastName}`;
            const deletedUserDetails = `Email: ${internalUser.Internal_Email}, Tipo: ${internalUser.Internal_Type}, Área: ${internalUser.Internal_Area}`;

            await AuditModel.registerAudit(
                internalId, 
                "DELETE",
                "InternalUser",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó lógicamente al usuario interno ${deletedUserName} (ID: ${id}) - ${deletedUserDetails}, Estado anterior: ${internalUser.Internal_Status} → Nuevo estado: Inactivo`
            );
            return internalUser;
        } catch (error) {
            throw new Error(`Error deleting internal user: ${error.message}`);
        }
    }

    //LOGIN METHOD
    
    static async authenticate(Internal_Email, Internal_Password) {
        try {
            console.log("Datos de autenticación:", Internal_Email, Internal_Password);
            const internalUser = await this.getByEmail(Internal_Email);
            console.log("Usuario interno encontrado:", internalUser);
            if (!internalUser) return null;

            const isPasswordValid = await bcrypt.compare(Internal_Password, internalUser.Internal_Password);
            console.log("Contrasenias comparadas:", isPasswordValid);
            if (!isPasswordValid) return null;

            if (internalUser.Internal_Status !== "Activo") {
                return { status: 'inactive', message: 'El usuario se encuentra inactivo.' };
            }

            const token = jwt.sign(
                {
                    id: internalUser.Internal_ID,
                    name: `${internalUser.Internal_Name} ${internalUser.Internal_LastName}`,
                    email: internalUser.Internal_Email,
                    type: internalUser.Internal_Type,
                    profile: internalUser.Profile_ID,
                    area: internalUser.Internal_Area,
                    phone: internalUser.Internal_Phone,
                    status: internalUser.Internal_Status,
                    picture: internalUser.Internal_Picture
                },
                SECRET_JWT_KEY,
                { expiresIn: "6h" }
            );

            return token;
        } catch (error) {
            throw new Error(`Error en autenticación: ${error.message}`);
        }
    }

    //RESET PASSWORD METHODS

    //verifyResetCode: Verifica si el código de reseteo es válido (Recibe el email y el código)
    static async verifyResetCode(email, code) {
        try {
            if (!email || !code) {
                throw new Error("El email y el código son obligatorios");
            }

            const user = await InternalUser.findOne({ where: { Internal_Email: email } });
            if (!user) {
                throw new Error("Usuario no encontrado");
            }

            const resetRecord = await ResetPassword.findOne({
                where: { userId: user.Internal_ID, code }
            });
            if (!resetRecord) {
                throw new Error("El código no es válido");
            }

            if (resetRecord.expires < new Date()) {
                throw new Error("El código ha expirado");
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    //saveResetCode: Almacena un código de reseteo en la base de datos (Recibe el ID del usuario y el código)
    static async saveResetCode(userId, code) {
        try {
            await ResetPassword.destroy({ where: { userId } });

            const expires = new Date(Date.now() + 15 * 60 * 1000); // Expira en 15 minutos
            await ResetPassword.create({ userId, code, expires });

            return true;
        } catch (error) {
            throw error;
        }
    }

     /** 🔹 Actualizar la huella del usuario */
     static async updateHuella(cedula, huellaBase64, internalUser) {
        try {
            const internalId = internalUser || getUserId();
            const usuario = await this.getById(cedula);
            if (!usuario) return null; // 🔹 Usuario no encontrado

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

            // 🔹 Convertir la huella de Base64 a Buffer (BLOB)
            const huellaBuffer = Buffer.from(huellaBase64, "base64");
            console.log("➡️ Huella convertida a Buffer:", huellaBuffer);

            const previousHuellaStatus = usuario.Internal_Huella ? 'Tenía huella registrada' : 'No tenía huella registrada';

            // 🔹 Actualizar la huella en la base de datos
            const [rowsUpdated] = await InternalUser.update(
                { Internal_Huella: huellaBuffer },
                { where: { Internal_ID: cedula, Internal_Status: 'Activo' } }
            );

            if (rowsUpdated === 0) return null; // 🔹 Si no se actualizó nada

            const targetUserName = `${usuario.Internal_Name} ${usuario.Internal_LastName}`;

            // 🔹 Registrar en auditoría la actualización de huella
            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "InternalUser",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la huella dactilar del usuario interno ${targetUserName} (ID: ${cedula}) - Estado anterior: ${previousHuellaStatus} → Nueva huella registrada`
            );

            return await this.getById(cedula); // ✅ Retorna el usuario actualizado
        } catch (error) {
            throw new Error(`Error al actualizar huella: ${error.message}`);
        }
    }

    /** 🔹 Obtener la huella de un usuario */
    static async getHuella(cedula) {
        try {
            const usuario = await this.getById(cedula);
            if (!usuario || !usuario.Internal_Huella) return null; // 🔹 Si no hay huella

            const huellaBase64 = usuario.Internal_Huella.toString("base64");
            // 🔹 Convertir la huella de Buffer a Base64 para enviarla al frontend
            console.log("➡️ Huella desde BD:", huellaBase64);
            console.log("➡️ Longitud:", huellaBase64.length); // 🔥 aquí debe ser > 400 mínimo
            return huellaBase64;
            
        } catch (error) {
            throw new Error(`Error al obtener la huella: ${error.message}`);
        }
    }

    static async getUserByTypeEstudiante() {
        try {
            return await InternalUser.findAll({
                where: { Internal_Type: 'Estudiante', Internal_Status: 'Activo' },
                attributes: ['Internal_ID', 'Internal_Name', 'Internal_LastName', 'Internal_Email', 'Internal_Phone', 'Internal_Area', 'Internal_Status', 'Internal_Type', 'Internal_Huella'],               
            });
        } catch (error) {
            throw new Error(`Error al obtener usuarios tipo estudiante: ${error.message}`);
        }
    }


    //deleteResetCode: Elimina un código de reseteo de la base de datos (Recibe el email)
    static async deleteResetCode(email) {
        try {
            const user = await InternalUser.findOne({ where: { Internal_Email: email } });
            if (user) {
                await ResetPassword.destroy({ where: { userId: user.Internal_ID } });
            }
        } catch (error) {
            throw error;
        }
    }

    //updatePassword: Actualiza la contraseña de un usuario cuando se olvida la contraseña (Recibe el email y la nueva contraseña)
    static async updatePassword(email, newPassword) {
        try {
            const user = await InternalUser.findOne({ where: { Internal_Email: email } });
            if (!user) return false;

            const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
            const [updatedRows] = await InternalUser.update(
                { Internal_Password: hashedPassword },
                { where: { Internal_ID: user.Internal_ID } }
            );

            return updatedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    //changePassword: Cambia la contraseña de un usuario (Recibe el ID del usuario, la contraseña actual y la nueva contraseña)
    static async changePassword(userId, oldPassword, newPassword) {
        try {
            const user = await InternalUser.findOne({ where: { Internal_ID: userId } });
            if (!user) return false;

            const isPasswordValid = await bcrypt.compare(oldPassword, user.Internal_Password);
            if (!isPasswordValid) return false;

            const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
            const [updatedRows] = await InternalUser.update(
                { Internal_Password: hashedPassword },
                { where: { Internal_ID: userId } }
            );

            return updatedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async updateProfilePicture(userId, imageUrl) {
        try {
            const usuario = await this.getById(userId);
            if (!usuario) return false;

            const previousPictureStatus = usuario.Internal_Picture ? 'Tenía foto de perfil' : 'No tenía foto de perfil';

            const [rowsUpdated] = await InternalUser.update(
                { Internal_Picture: imageUrl },
                { where: { Internal_ID: userId } }
            );

            if (rowsUpdated > 0) {
                const targetUserName = `${usuario.Internal_Name} ${usuario.Internal_LastName}`;
                
                // Register audit log with self-update (user updates their own profile picture)
                await AuditModel.registerAudit(
                    userId,
                    "UPDATE",
                    "InternalUser",
                    `${targetUserName} (ID: ${userId}) actualizó su foto de perfil - Estado anterior: ${previousPictureStatus} → Nueva foto registrada`
                );
            }

            return rowsUpdated > 0;
        } catch (error) {
            console.error(`Error updating profile picture URL: ${error.message}`);
            throw new Error(`Error updating profile picture URL: ${error.message}`);
        }
    }  


}