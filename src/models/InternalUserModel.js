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
            // Registrar en auditoría la creación
            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "InternalUser",
                `El usuario interno ${internalId} creó un nuevo registro de Usuario Interno con ID ${newRecord.Internal_ID}`
            );
            return newRecord;
            
        } catch (error) {
            console.log(`Error creating internal user: ${error.message}`);
            throw new Error(`Error creating internal user: ${error.message}`);
        }
    }

    static async bulkCreateUsers(data, options = {}) {
        try {
          const entries = Array.isArray(data) ? data : [data];
          if (entries.length === 0) {
            throw new Error("No hay usuarios para crear.");
          }
      
          const createdUsers = await InternalUser.bulkCreate(entries, options);
      
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
            // Registrar en auditoría la actualización
            await AuditModel.registerAudit(
                internalID,
                "UPDATE",
                "InternalUser",
                `El usuario interno ${internalID} actualizó el usuario interno con ID ${id}`
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

            await InternalUser.update(
                { Internal_Status: "Inactivo" },
                { where: { Internal_ID: id } }
            );
            await AuditModel.registerAudit(
                internalId, 
                "DELETE",
                "User",
                `El usuario interno ${internalId} eliminó lógicamente al usuario ${id}`
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
     static async updateHuella(cedula, huellaBase64) {
        try {
            const usuario = await this.getById(cedula);
            if (!usuario) return null; // 🔹 Usuario no encontrado

            // 🔹 Convertir la huella de Base64 a Buffer (BLOB)
            const huellaBuffer = Buffer.from(huellaBase64, "base64");
            console.log("➡️ Huella convertida a Buffer:", huellaBuffer);

            // 🔹 Actualizar la huella en la base de datos
            const [rowsUpdated] = await InternalUser.update(
                { Internal_Huella: huellaBuffer },
                { where: { Internal_ID: cedula, Internal_Status: 'Activo' } }
            );

            if (rowsUpdated === 0) return null; // 🔹 Si no se actualizó nada
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

            const [rowsUpdated] = await InternalUser.update(
                { Internal_Picture: imageUrl },
                { where: { Internal_ID: userId } }
            );
            return rowsUpdated > 0;
        } catch (error) {
            console.error(`Error updating profile picture URL: ${error.message}`);
            throw new Error(`Error updating profile picture URL: ${error.message}`);
        }
    }  


}