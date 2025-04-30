import { InternalUserModel } from "../models/InternalUserModel.js";
import { z } from "zod";
import { SALT_ROUNDS } from "../config.js";
import { EMAIL_USER, EMAIL_PASS } from "../config.js";
import { cloudinary } from "../cloudinary.js";
import { UserXPeriodModel } from "../models/schedule_models/User_PeriodModel.js"; // Modelo de asignaciones a períodos
import { sequelize } from "../database/database.js";

import { getUserId } from '../sessionData.js';

import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { parse } from "dotenv";
import e from "express";

//random password generator
// Función para generar una contraseña aleatoria
function generateRandomPassword(length = 8) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

export class InternalUserController {

    // GET METHODS

    static async getInternalUsers(req, res) {
        try {
            const internalUsers = await InternalUserModel.getAll();
            res.json(internalUsers);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const internalUser = await InternalUserModel.getById(id);
            if (internalUser) return res.json(internalUser);
            res.status(404).json({ message: "Internal user not found" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getByEmail(req, res) {
        const { email } = req.params;
        try {
          const internalUser = await InternalUserModel.getByEmail(email);
          if (internalUser) {
            return res.json(internalUser);
          } else {
            res.status(404).json({ message: "Usuario interno no encontrado" });
          }
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }

      static async getAllActiveLawyers(req, res) {
        const { area } = req.params; // Obtener el área desde los parámetros de consulta
        try {
            const lawyers = await InternalUserModel.getAllActiveLawyers(area);
            res.json(lawyers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAllLawyers (req, res) {
        try {
            const lawyers = await InternalUserModel.getAllLawyers();
            res.json(lawyers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getStudentsByArea(req, res) {
        const { area } = req.params;
        try {
            const students = await InternalUserModel.getStudentsByArea(area);
            res.json(students);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    static async getIdByNameAndLastName(req, res) {
        const { firstName, lastName } = req.params; // Cambiado de req.query a req.params
    
        try {
            if (!firstName || !lastName) {
                return res.status(400).json({ message: 'First name and last name are required' });
            }
    
            const internalId = await InternalUserModel.getIdByNameAndLastName(firstName, lastName);
    
            if (!internalId) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            res.json({ Internal_ID: internalId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    // CREATE, UPDATE AND DELETE METHODS

    static async createInternalUser(req, res) {
        try {
            
            // Definir el esquema de validación con Zod
            const internalUserSchema = z.object({
                Internal_ID: z.string().min(1, { message: "El ID es obligatorio" }),
                Internal_Name: z.string().min(1, { message: "El nombre es obligatorio" }),
                Internal_LastName: z.string().min(1, { message: "El apellido es obligatorio" }),
                Internal_Email: z.string().email({ message: "Correo no válido" }),
                Internal_Password: z.string().min(1, { message: "La contraseña es obligatoria" }),
                Internal_Type: z.string().min(1, { message: "El tipo es obligatorio" }),
                Internal_Area: z.string().min(1, { message: "El área es obligatoria" }),
                Internal_Phone: z.string().length(10, { message: "El teléfono debe tener 10 caracteres" }),
                Internal_Status: z.string().min(1, { message: "El estado es obligatorio" }),
                Internal_Huella: z.any().optional().nullable() // <-- Campo opcional y nullable
            });
    
            // Validar el request body
            const parseResult = internalUserSchema.safeParse(req.body);
            console.log(parseResult);

            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map((err) => err.message).join(', ');
                return res.status(400).json({ message: errorMessages });
            }
    
            // Extraer los datos validados
            const data = parseResult.data;
    
            // Asignar null si no se recibe Internal_Huella
            if (!data.Internal_Huella) {
                data.Internal_Huella = null;
            }
    
            // // Verificar si ya existe un usuario con esa cédula
            // const existingID = await InternalUserModel.getById(data.Internal_ID);
            // if (existingID) {
            //     return res.status(401).json({ message: "Ya existe un usuario con esa cédula" });
            // }
    
            // // Verificar si ya existe un usuario con ese correo
            // const existingEmail = await InternalUserModel.getByEmail(data.Internal_Email);
            // if (existingEmail) {
            //     return res.status(401).json({ message: "Ya existe un usuario con ese correo" });
            // }
    
            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(data.Internal_Password, SALT_ROUNDS);
            data.Internal_Password = hashedPassword;
    

            const internalUser = await InternalUserModel.create(data);

            return res.status(201).json(internalUser);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    

    static async update(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"]
            const updatedInternalUser = await InternalUserModel.update(id, req.body, internalId);
            if (!updatedInternalUser) return res.status(404).json({ message: "Internal user not found" });

            return res.json(updatedInternalUser);
        } catch (error) {
            console.error("Error al actualizar el usuario interno:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"]
            const deletedInternalUser = await InternalUserModel.delete(id, internalId);
            if (!deletedInternalUser) return res.status(404).json({ message: "Internal user not found" });

            return res.json({ message: "Internal user deleted", internalUser: deletedInternalUser });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // LOGIN METHOD

    static async login(req, res) {
        try {
            // Validación con Zod
            const loginSchema = z.object({
                Internal_Email: z.string().email({ message: "Correo no válido" }),
                Internal_Password: z.string().min(1, { message: "La contraseña es obligatoria" })
            });
  
            const parseResult = loginSchema.safeParse(req.body);
            if (!parseResult.success) {
                const errorMessages = parseResult.error.errors.map(err => err.message).join(", ");
                return res.status(400).json({ message: errorMessages });
            }
  
            const { Internal_Email, Internal_Password } = parseResult.data;
  
            // Autenticar usuario
            const token = await InternalUserModel.authenticate(Internal_Email, Internal_Password);
            if (!token) {
                return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
            }
            if (token.status === 'inactive') {
              // Mensaje específico para usuario inactivo
              return res.status(403).json({ message: "El usuario se encuentra inactivo." });
          }

            return res
                .cookie("access_token", token, {
                    httpOnly: true,
                    sameSite: false,
                    secure: false, // En producción, cambiar a true para que funcione solo en HTTPS
                    maxAge: 6 * 60 * 60 * 1000 // 6 horas
                })
                .json({ token });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }


    static async logout(req, res) {
        return res.clearCookie("access_token").json({ message: "Logout successful" });
    }

    // RESET PASSWORD METHODS

    //requestResetPassword: Solicita un cambio de contraseña, enviando un código de verificación al correo
    static async requestResetPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "El email es obligatorio" });
            }
  
            const user = await InternalUserModel.getByEmail(email);
            if (!user) {
                return res.status(400).json({ message: "El email no está registrado" });
            }
  
            // Generar código de 6 dígitos
            const code = Math.floor(100000 + Math.random() * 900000).toString();
  
            // Guardar código en la base de datos
            await InternalUserModel.saveResetCode(user.Internal_ID, code);
  
            // Configurar el transporte de correo
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: { user: EMAIL_USER, pass: EMAIL_PASS },
            });
  
            // Enviar el correo con el código
            const mailOptions = {
              from: '"Support Balanza Web" <anakin7456@gmail.com>',
              to: email,
              subject: '🔒 Código para reiniciar contraseña',
              html: `
              <html>
                <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                  <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <h2 style="text-align: center; color: #4a90e2;">🔒 Recupera tu contraseña</h2>
                    <p>Hola,</p>
                    <p>Hemos recibido una solicitud para restablecer tu contraseña. Utiliza el siguiente código para continuar:</p>
                    <p style="text-align: center; font-size: 28px; font-weight: bold; color: #4a90e2; margin: 20px 0;">${code}</p>
                    <p>Este código expirará en <strong>15 minutos</strong>.</p>
                    <p>Si no solicitaste este cambio, ignora este mensaje.</p>
                    <p>Saludos cordiales,</p>
                    <p><em>El equipo de Tu App</em></p>
                  </div>
                </body>
              </html>
              `
            };   
  
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error("Error al enviar email:", error);
                return res.status(500).json({ message: "Error al enviar el correo.", error });
              }
              return res.status(200).json({ message: "En caso de estar registrado este email, se enviará un código de verificación." });
            });
        } catch (error) {
            return res.status(500).json({ message: "Error al solicitar el código", error: error.message });
        }
    }


    //verifyCode: Verifica si el código de reseteo es válido
    static async verifyCode(req, res) {
        try {
            const { email, code } = req.body;
            if (!email || !code) {
                return res.status(400).json({ message: "Email y código son obligatorios" });
            }
  
            const isValid = await InternalUserModel.verifyResetCode(email, code);
            if (!isValid) {
                return res.status(400).json({ message: "Código inválido o expirado" });
            }
  
            return res.status(200).json({ message: "Código válido" });
        } catch (error) {
            return res.status(500).json({ message: "Error al verificar el código", error: error.message });
        }
    }

    //resetPassword: Cambia la contraseña del usuario, recibiendo el email, el código y la nueva contraseña (Usando el código de reseteo)
    static async resetPassword(req, res) {
        try {
            const { email, code, newPassword } = req.body;
            if (!email || !code || !newPassword) {
                return res.status(400).json({ message: "Todos los campos son obligatorios" });
            }
  
            // Verificar código antes de permitir el cambio de contraseña
            const isValid = await InternalUserModel.verifyResetCode(email, code);
            if (!isValid) {
                return res.status(400).json({ message: "Código inválido o expirado" });
            }
  
            // Actualizar contraseña
            const updated = await InternalUserModel.updatePassword(email, newPassword);
            if (!updated) {
                return res.status(400).json({ message: "Error al actualizar la contraseña" });
            }
  
            // Eliminar el código de reseteo usado
            await InternalUserModel.deleteResetCode(email);
  
            return res.status(200).json({ message: "Contraseña actualizada correctamente" });
        } catch (error) {
            return res.status(500).json({ message: "Error al restablecer la contraseña", error: error.message });
        }
    }

    
        /** 🔹 Actualizar la huella del usuario */
        static async actualizarHuella(req, res) {
            try {
                const { usuarioCedula, template } = req.body;
                if (!usuarioCedula || !template) {
                    return res.status(400).json({ message: "Cédula y huella son requeridas." });
                }
    
                // 🔹 Llamamos al modelo para actualizar la huella
                const usuarioActualizado = await InternalUserModel.updateHuella(usuarioCedula, template);
    
                if (!usuarioActualizado) {
                    return res.status(404).json({ message: "Usuario no encontrado o no se pudo actualizar." });
                }
    
                res.json({ message: "Huella actualizada correctamente.", usuario: usuarioActualizado });
            } catch (error) {
                console.error("Error al actualizar huella:", error);
                res.status(500).json({ message: "Error interno del servidor." });
            }
        }

      //  static async createInternalUsersBulk(req, res) {
      //       try {
      //         // Normalizar: si no es un array, lo convertimos en array
      //         const records = Array.isArray(req.body) ? req.body : [req.body];
        
      //         // Definir el esquema de validación para cada registro
      //         const internalUserSchema = z.object({
      //           Internal_ID:  z.string().min(1, { message: "El ID es obligatorio" }),
      //           Internal_Name: z.string().min(1, { message: "El nombre es obligatorio" }),
      //           Internal_LastName: z.string().min(1, { message: "El apellido es obligatorio" }),
      //           Internal_Email: z.string().email({ message: "Correo no válido" }),
      //           // Aquí ya no se realiza preprocess; manejaremos la contraseña por separado
      //           Internal_Password: z.string().optional(),
      //           Internal_Type: z.string().min(1, { message: "El tipo es obligatorio" }),
      //           Internal_Area: z.string().min(1, { message: "El área es obligatoria" }),
      //           Internal_Phone: z.string().optional(),
      //           Internal_Status: z.string().min(1, { message: "El estado es obligatorio" }).default(""),
      //           Internal_Huella: z.any().optional().nullable()
      //         }).passthrough();
        
      //         // Crear el transporter de correo una sola vez
      //         const transporter = nodemailer.createTransport({
      //           host: "smtp.gmail.com",
      //           port: 465,
      //           secure: true,
      //           auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      //         });
        
      //         // Array para almacenar resultados por cada registro
      //         const results = [];
        
      //         // Procesar cada registro
      //         for (const record of records) {
      //           // Validar cada registro
      //           const parseResult = internalUserSchema.safeParse(record);
      //           if (!parseResult.success) {
      //             const errorMessages = parseResult.error.errors.map((err) => err.message).join(', ');
      //             results.push({ Internal_ID: record.Internal_ID || null, error: errorMessages });
      //             continue;
      //           }
      //           const data = parseResult.data;
        
      //           // Verificar duplicados por cédula o correo
      //           const existingID = await InternalUserModel.getById(data.Internal_ID);
      //           const existingEmail = await InternalUserModel.getByEmail(data.Internal_Email);
      //           if (existingID || existingEmail) {
      //             results.push({ Internal_ID: data.Internal_ID, error: "Ya existe un usuario con esa cédula o correo" });
      //             continue;
      //           }
        
      //           // Manejo de la contraseña: si no se envía (o es cadena vacía), se genera una contraseña aleatoria.
      //           // Conservamos la contraseña en texto plano para luego enviarla por correo.
      //           let plainPassword = data.Internal_Password;
      //           console.log("Contraseña recibida:", plainPassword);
      //           if (!plainPassword || plainPassword.trim() === "") {
      //             plainPassword = generateRandomPassword(8);
      //           }
        
      //           // Hashear la contraseña
      //           const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
      //           data.Internal_Password = hashedPassword;
        
      //           // Crear el usuario en la base de datos
      //           const internalUser = await InternalUserModel.create(data);
        
      //           // Preparar las opciones del correo; se envía siempre, usando la contraseña en texto plano (ya sea la ingresada o generada)
      //           const mailOptions = {
      //             from: '"Support Balanza Web" <cjgpuce.system@gmail.com>',
      //             to: data.Internal_Email,
      //             subject: 'Tus credenciales de acceso',
      //             html: `
      //               <html>
      //                 <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      //                   <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      //                     <h2 style="text-align: center; color: #4a90e2;">Bienvenido a Balanza Web</h2>
      //                     <p>Estas son tus credenciales de acceso:</p>
      //                     <p><strong>Correo:</strong> ${data.Internal_Email}</p>
      //                     <p><strong>Contraseña:</strong> ${plainPassword}</p>
      //                     <p>Por favor, ingresa con estas credenciales y cambia tu contraseña lo antes posible.</p>
      //                     <p>Saludos,</p>
      //                     <p>El equipo de Balanza Web</p>
      //                   </div>
      //                 </body>
      //               </html>
      //             `
      //           };
        
      //           // Enviar el correo y manejar errores individualmente
      //           try {
      //             await transporter.sendMail(mailOptions);
      //             console.log(`Correo enviado a ${data.Internal_Email}`);
      //           } catch (errorEmail) {
      //             console.error(`Error al enviar email a ${data.Internal_Email}:`, errorEmail);
      //           }
        
      //           results.push({ Internal_ID: data.Internal_ID, result: "Creado", user: internalUser });
      //         }
        
      //         return res.status(201).json({ message: "Proceso completado", results });
      //       } catch (error) {
      //           console.error("Error al crear usuarios internos:", error);
      //         return res.status(500).json({ error: error.message });
      //       }
      //     }

      static async createInternalUsersBulk(req, res) {
        const transaction = await sequelize.transaction();
        try {
          const periodId = req.params.periodId;
          const records = Array.isArray(req.body) ? req.body : [req.body];
      
          const internalUserSchema = z.object({
            Internal_ID: z.string().min(1, { message: "El ID es obligatorio" }),
            Internal_Name: z.string().min(1, { message: "El nombre es obligatorio" }),
            Internal_LastName: z.string().min(1, { message: "El apellido es obligatorio" }),
            Internal_Email: z.string().optional(),
            Internal_Password: z.string().optional(),
            Internal_Type: z.string().min(1, { message: "El tipo es obligatorio" }),
            Internal_Area: z.string().min(1, { message: "El área es obligatoria" }),
            Internal_Phone: z.string().optional(),
            Internal_Status: z.string().min(1, { message: "El estado es obligatorio" }),
            Internal_Huella: z.any().optional().nullable()
          }).passthrough();
      
          const usersToCreate = [];
          const userXPeriodToCreate = [];
          const emailsToSend = []; // Para enviar correos después
      
          for (const record of records) {
            const parseResult = internalUserSchema.safeParse(record);
            if (!parseResult.success) {
              const errorMessages = parseResult.error.errors.map((err) => err.message).join(", ");
              throw new Error(`Error en registro: ${errorMessages}`);
            }
      
            const data = parseResult.data;
      
            // Email temporal si no hay válido
            if (!data.Internal_Email || !data.Internal_Email.includes("@")) {
              data.Internal_Email = `${data.Internal_ID}@temporal.local`;
            }
      
            // Contraseña aleatoria si falta
            let plainPassword = data.Internal_Password;
            if (!plainPassword || plainPassword.trim() === "") {
              plainPassword = generateRandomPassword(8);
            }
      
            const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
      
            usersToCreate.push({
              Internal_ID: data.Internal_ID,
              Internal_Name: data.Internal_Name,
              Internal_LastName: data.Internal_LastName,
              Internal_Email: data.Internal_Email,
              Internal_Password: hashedPassword,
              Internal_Type: data.Internal_Type,
              Internal_Area: data.Internal_Area,
              Internal_Phone: data.Internal_Phone || null,
              Internal_Status: data.Internal_Status,
              Internal_Huella: data.Internal_Huella || null
            });

              
              if (periodId && periodId !== 'sin-periodo') {
                userXPeriodToCreate.push({
                  Period_ID: periodId,
                  Internal_ID: data.Internal_ID
                });
              }
      
            // Guardamos para enviar correo solo si NO es temporal
            if (!data.Internal_Email.endsWith("@temporal.local")) {
              emailsToSend.push({
                to: data.Internal_Email,
                password: plainPassword
              });
            }
          }
      
          // 🔹 1. Crear usuarios y asignaciones en transaction
          await InternalUserModel.bulkCreateUsers(usersToCreate, { transaction });
          if (userXPeriodToCreate.length > 0) {
            await UserXPeriodModel.create(userXPeriodToCreate, { transaction });
          }
      
          await transaction.commit(); // Confirmamos
      
          // 🔹 2. Enviar correos después de confirmar la transacción
          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user: EMAIL_USER, pass: EMAIL_PASS }
          });
      
          for (const emailInfo of emailsToSend) {
            const mailOptions = {
              from: '"Support Balanza Web" <cjgpuce.system@gmail.com>',
              to: emailInfo.to,
              subject: 'Tus credenciales de acceso',
              html: `
                <html>
                  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                    <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                      <h2 style="text-align: center; color: #4a90e2;">Bienvenido a Balanza Web</h2>
                      <p>Estas son tus credenciales de acceso:</p>
                      <p><strong>Correo:</strong> ${emailInfo.to}</p>
                      <p><strong>Contraseña:</strong> ${emailInfo.password}</p>
                      <p>Por favor, ingresa con estas credenciales y cambia tu contraseña lo antes posible.</p>
                      <p>Saludos,</p>
                      <p>El equipo de Balanza Web</p>
                    </div>
                  </body>
                </html>
              `
            };
      
            try {
              await transporter.sendMail(mailOptions);
              console.log(`Correo enviado exitosamente a ${emailInfo.to}`);
            } catch (errorEmail) {
              console.error(`Error al enviar correo a ${emailInfo.to}:`, errorEmail);
            }
          }
      
          return res.status(201).json({ message: "Usuarios creados y correos enviados correctamente." });
      
        } catch (error) {
          console.error("Error en createInternalUsersBulk:", error);
          await transaction.rollback();
          return res.status(500).json({ error: error.message });
        }
      }
      
      
              
    
        /** 🔹 Obtener la huella de un usuario */
        static async obtenerHuella(req, res) {
            try {
                const { usuarioCedula } = req.params;
                if (!usuarioCedula) {
                    return res.status(400).json({ message: "Cédula requerida." });
                }
    
                // 🔹 Llamamos al modelo para obtener la huella
                const huellaBase64 = await InternalUserModel.getHuella(usuarioCedula);
    
                if (!huellaBase64) {
                    return res.status(404).json({ message: "No se encontró huella para este usuario." });
                }
    
                res.json({ message: "Huella encontrada.", huella: huellaBase64 });
            } catch (error) {
                console.error("Error al obtener huella:", error);
                res.status(500).json({ message: "Error interno del servidor." });
            }
        }

        static async getInternalUserByTypeEstudiante(req, res) {
            try {
                const internalUsers = await InternalUserModel.getUserByTypeEstudiante();
                res.json(internalUsers);
            } catch (error) {
                res.status(500).json(error);
            }
        }

        


    

    //changePassword: Cambia la contraseña del usuario, recibiendo el email y la nueva contraseña (Usando la contraseña actual)
    static async changePassword(req, res) {
        try {
            const { email, currentPassword, newPassword } = req.body;
            if (!email || !currentPassword || !newPassword) {
                return res.status(400).json({ message: "Todos los campos son obligatorios" });
            }
  
            // Verificar la contraseña actual
            const isValid = await InternalUserModel.authenticate(email, currentPassword);
            if (!isValid) {
                return res.status(400).json({ message: "Contraseña actual incorrecta" });
            }
  
            // Actualizar la contraseña
            const updated = await InternalUserModel.updatePassword(email, newPassword);
            if (!updated) {
                return res.status(400).json({ message: "Error al actualizar la contraseña" });
            }
  
            return res.status(200).json({ message: "Contraseña actualizada correctamente" });
        } catch (error) {
            return res.status(500).json({ message: "Error al cambiar la contraseña", error: error.message });
        }
    }

    //PROFILE PICTURE MANAGEMENT


    static async uploadProfilePicture(req, res) {
          const internalId = req.headers["internal-id"] || getUserId(); 
      // Or use: const userId = req.user.id; if authMiddleware sets req.user

      try {
          const userId = internalId; // Use the correct way to get userId

          if (!userId) {
              return res.status(401).json({ message: "Usuario no autenticado." });
          }

          if (!req.file) {
              return res.status(400).json({ message: "No se ha subido ningún archivo." });
          }

          // --- 1. Get current user data to find the old picture URL ---
          const currentUser = await InternalUserModel.getById(userId);
          const oldPictureUrl = currentUser?.Internal_Picture;
          let oldPublicId = null;

          if (oldPictureUrl && oldPictureUrl.includes('res.cloudinary.com')) {
              try {
                  // Extract public_id (including folder) from the old URL
                  const urlParts = oldPictureUrl.split('/');
                  // Find the index of 'upload', the public_id parts start 2 indices after it
                  const uploadIndex = urlParts.indexOf('upload');
                  if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
                       const publicIdWithFormat = urlParts.slice(uploadIndex + 2).join('/');
                       oldPublicId = publicIdWithFormat.substring(0, publicIdWithFormat.lastIndexOf('.')) || publicIdWithFormat; // Remove extension if present
                  }
              } catch (e) {
                  console.error("Could not parse old public_id from URL:", oldPictureUrl, e);
                  // Continue without deleting if parsing fails
              }
          }
          // --- End of Step 1 ---

          // --- 2. Upload new image to Cloudinary ---
          const result = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                  {
                      folder: "profile_pics",
                      // Optional: Overwrite based on public_id if you want to keep the same ID (less common for profile pics)
                      // public_id: oldPublicId || undefined, // Use old ID if exists
                      // invalidate: true // If overwriting, invalidate CDN cache
                  },
                  (error, uploadResult) => {
                      if (error) return reject(error);
                      resolve(uploadResult);
                  }
              );
              uploadStream.end(req.file.buffer);
          });

          if (!result || !result.secure_url) {
              throw new Error('Error al subir la imagen a Cloudinary');
          }
          const newPictureUrl = result.secure_url;
          const newPublicId = result.public_id; 

          // En caso de que el usuario tenga una foto de perfil se la actualiza
          const updated = await InternalUserModel.updateProfilePicture(userId, newPictureUrl);


          if (!updated) {
              // If DB update fails, try to delete the *newly uploaded* image from Cloudinary
              console.error("Database update failed. Attempting to delete newly uploaded image:", newPublicId);
              try {
                  await cloudinary.uploader.destroy(newPublicId);
              } catch (cleanupError) {
                  console.error("Failed to cleanup newly uploaded image after DB error:", cleanupError);
              }
              return res.status(500).json({ message: "No se pudo actualizar la URL en la base de datos." });
          }

          // Si la imagen se subió correctamente y se actualizó la base de datos, eliminamos la imagen anterior
          if (oldPublicId && oldPublicId !== newPublicId) { 
              console.log(`Database updated. Attempting to delete old image: ${oldPublicId}`);
              try {
                  await cloudinary.uploader.destroy(oldPublicId);
                  console.log(`Successfully deleted old image: ${oldPublicId}`);
              } catch (deleteError) {
                  console.error("Failed to delete old profile picture from Cloudinary:", oldPublicId, deleteError);
              }
          }
          return res.status(200).json({
              message: "Foto de perfil actualizada.",
              profilePictureUrl: newPictureUrl // Devuelvemos la nueva URL
          });


      } catch (error) {
          console.error("Error uploading profile picture:", error);
          return res.status(500).json({ message: "Error interno al subir la imagen.", error: error.message });
      }
  }

    static async updateProfilePicture(req, res) {
      try {
          const { userId } = req.params; // Obtener el ID del usuario desde los parámetros de la URL
          const { imageUrl } = req.body; // Obtener la URL de la imagen desde el cuerpo de la solicitud

          if (!userId || !imageUrl) {
              return res.status(400).json({ message: "User ID and image URL are required" });
          }

          const updated = await InternalUserModel.updateProfilePicture(userId, imageUrl);
          if (!updated) {
              return res.status(404).json({ message: "User not found or unable to update profile picture" });
          }

          return res.status(200).json({ message: "Profile picture updated successfully" });
      } catch (error) {
          console.error("Error updating profile picture:", error);
          return res.status(500).json({ message: "Internal server error" });
      }
    }

}
