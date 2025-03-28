import { InternalUser } from "../schemas/Internal_User.js"; 
import { ResetPassword } from '../schemas/Reset_Password.js';
import { SECRET_JWT_KEY } from "../config.js";
import { SALT_ROUNDS } from '../config.js';
import { AuditModel } from "./AuditModel.js"; // Para registrar en auditoría

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
                        await AuditModel.registerAudit(
                            internalId,
                            "INSERT",
                            "LivingGroup",
                            `El usuario interno ${internalId} creó el registro de grupo de convivencia con ID ${newRecord.Internal_ID}`
                        );
                        return newRecord;
        } catch (error) {
            throw new Error(`Error creating internal user: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const internalUser = await this.getById(id);
            if (!internalUser) return null;

            const [rowsUpdated] = await InternalUser.update(data, {
                where: { Internal_ID: id }
            });

            if (rowsUpdated === 0) return null;
            // 🔹 Registrar en auditoría la actualización
            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "LivingGroup",
                `El usuario interno ${internalId} actualizó el registro de Usuario Interno con ID ${id}`
            );
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating internal user: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
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
            const internalUser = await this.getByEmail(Internal_Email);
            if (!internalUser) return null;

            // Si no es un administrador, se verifica que la contraseña en texto plano coincida con la encriptada en la base de datos
            // Esto no se hace para los administradores, ya que si es la primera vez que se inicia sesión, la contraseña en la base de datos
            // estará en texto plano y no se podrá comparar con la contraseña encriptada
            if (internalUser.Internal_Type !== "SuperAdmin") { //El primer usuario que se registra debe tener el TIPO: SuperAdmin
                const isPasswordValid = await bcrypt.compare(Internal_Password, internalUser.Internal_Password);
                if (!isPasswordValid) return null;
            }
            else {
                if (Internal_Password !== internalUser.Internal_Password) return null;
            }

            const token = jwt.sign(
                {
                    id: internalUser.Internal_ID,
                    name: `${internalUser.Internal_Name} ${internalUser.Internal_LastName}`,
                    email: internalUser.Internal_Email,
                    type: internalUser.Internal_Type,
                    area: internalUser.Internal_Area,
                    phone: internalUser.Internal_Phone,
                    status: internalUser.Internal_Status
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


}
