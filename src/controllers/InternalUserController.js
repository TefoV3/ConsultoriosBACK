import { InternalUserModel } from "../models/InternalUserModel.js";
import { Profiles } from "../schemas/parameter_tables/Profiles.js";
import { z } from "zod";
import { SALT_ROUNDS, EMAIL_SERVICE, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_TLS_REJECT_UNAUTHORIZED } from "../config.js";
import { cloudinary } from "../cloudinary.js";
import { UserXPeriodModel } from "../models/schedule_models/User_PeriodModel.js"; // Modelo de asignaciones a períodos
import { sequelize } from "../database/database.js";

import { getUserId } from "../sessionData.js";

import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { parse } from "dotenv";
import e from "express";

//random password generator
// Función para generar una contraseña aleatoria
function generateRandomPassword(length = 8) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// Función helper para crear transporter de correo con Gmail
function createEmailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    },
    pool: true, // Usar pool de conexiones
    maxConnections: 5, // Máximo de conexiones simultáneas
    maxMessages: 100, // Máximo de mensajes por conexión
    rateDelta: 1000, // Tiempo entre envíos (ms)
    rateLimit: 5 // Límite de mensajes por rateDelta
  });
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

  static async getAllLawyers(req, res) {
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
        return res
          .status(400)
          .json({ message: "First name and last name are required" });
      }

      const internalId = await InternalUserModel.getIdByNameAndLastName(
        firstName,
        lastName
      );

      if (!internalId) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ Internal_ID: internalId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // CREATE, UPDATE AND DELETE METHODS

  static async createInternalUser(req, res) {
    try {
      // Definir el esquema de validación con Zod
      const internalId = req.headers["internal-id"]
      console.log("Internal ID:", internalId);
      const internalUserSchema = z.object({
        Internal_ID: z.string().min(1, { message: "El ID es obligatorio" }),
        Internal_Name: z
          .string()
          .min(1, { message: "El nombre es obligatorio" }),
        Internal_LastName: z
          .string()
          .min(1, { message: "El apellido es obligatorio" }),
        Internal_Email: z.string().email({ message: "Correo no válido" }),
        Internal_Password: z
          .string()
          .min(1, { message: "La contraseña es obligatoria" }),
        Internal_Type: z.string().min(1, { message: "El tipo es obligatorio" }),
        Internal_Area: z.string().min(1, { message: "El área es obligatoria" }),
        Internal_Phone: z
          .string()
          .length(10, { message: "El teléfono debe tener 10 caracteres" }),
        Internal_Status: z
          .string()
          .min(1, { message: "El estado es obligatorio" }),
        Internal_Huella: z.any().optional().nullable(), // <-- Campo opcional y nullable
      });

      //Validar que no haya un usuario con el mismo ID y correo electrónico
      const existingUserById = await InternalUserModel.getById(req.body.Internal_ID);
      const existingUserByEmail = await InternalUserModel.getByEmail(req.body.Internal_Email);
      if (existingUserById) {
        return res.status(400).json({ message: "Ya existe un usuario con este ID." });
      }
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Ya existe un usuario con este correo electrónico." });
      }

      // Validar el request body
      const parseResult = internalUserSchema.safeParse(req.body);
      console.log(parseResult);

      if (!parseResult.success) {
        const errorMessages = parseResult.error.errors
          .map((err) => err.message)
          .join(", ");
        return res.status(400).json({ message: errorMessages });
      }

      // Extraer los datos validados
      const data = parseResult.data;

      // --- BUSCAR EL PROFILE_ID ---
      // 1. Buscamos el perfil en la BD usando el nombre que llegó.
      const profile = await Profiles.findOne({ where: { Profile_Name: data.Internal_Type } });

      // 2. Si no se encuentra, devolvemos un error.
      if (!profile) {
          return res.status(400).json({ message: `El perfil '${data.Internal_Type}' no es válido.` });
      }



      const plainPassword = data.Internal_Password;

      // Asignar null si no se recibe Internal_Huella
      if (!data.Internal_Huella) {
        data.Internal_Huella = null;
      }
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(
        data.Internal_Password,
        SALT_ROUNDS
      );


        const dataToCreate = {
            ...data,
            Profile_ID: profile.Profile_ID,
            Internal_Password: hashedPassword 
        };



      const internalUser = await InternalUserModel.create(dataToCreate, internalId);

      // --- Send welcome email ---
      try {
        // Configurar el transporte de correo usando la función helper
        const transporter = createEmailTransporter();

        // Enviar el correo con las credenciales
        const mailOptions = {
          from: `"Support Balanza Web" <${EMAIL_USER}>`, // Usar EMAIL_USER dinámicamente
          to: data.Internal_Email,
          subject: "¡Bienvenido/a a Balanza Web! Tus Credenciales de Acceso",
          html: `
      <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="20" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td align="center" style="border-bottom: 1px solid #e0e0e0; padding-bottom: 20px;">
                      <h1 style="color: #0056b3; margin: 0;">¡Bienvenido/a, ${
                        data.Internal_Name
                      }!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 20px;">
                      <p style="color: #333333; line-height: 1.6;">Estamos encantados de tenerte en <strong>Balanza Web</strong>.</p>
                      <p style="color: #333333; line-height: 1.6;">Aquí tienes tus credenciales para acceder a la plataforma:</p>
                      <div style="background-color: #eef5ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0; color: #333;"><strong>Correo Electrónico:</strong> ${
                          data.Internal_Email
                        }</p>
                        <p style="margin: 5px 0; color: #333;"><strong>Contraseña Temporal:</strong> ${plainPassword}</p>
                      </div>
                      <p style="color: #555555; line-height: 1.6;"><strong>Importante:</strong> Por tu seguridad, te recomendamos encarecidamente que cambies tu contraseña la primera vez que inicies sesión.</p>
                      <p style="color: #555555; line-height: 1.6;">Puedes hacerlo fácilmente:</p>
                      <ol style="color: #555555; line-height: 1.6; padding-left: 20px;">
                        <li>Inicia sesión con las credenciales proporcionadas.</li>
                        <li>Haz clic en tu <strong>Perfil</strong> (ubicado en la esquina inferior izquierda).</li>
                        <li>Selecciona la opción de <strong>Configuración</strong></li>
                        <li>Desplaza el cursor hacia abajo y encontrarás la opción para poder cambiar tu contraseña.</li>
                      </ol>
                      <p style="color: #333333; line-height: 1.6;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar a soporte.</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #888888;">
                      <p>Saludos cordiales,<br>El equipo de Consultorios Jurídicos PUCE</p>
                      <p>&copy; ${new Date().getFullYear()} Balanza Web. Todos los derechos reservados.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Correo de bienvenida enviado a ${data.Internal_Email}`);
      } catch (emailError) {
        console.error("Error al enviar el correo de bienvenida:", emailError);
        // Decide if you want to return an error or just log it
        // For now, we'll just log it and return the successful user creation response
      }

      return res.status(201).json(internalUser);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const internalId = req.headers["internal-id"]; // User performing the action
      const updateData = req.body;

      console.log("Update Data:", updateData); // Log the update data for debugging

      // 1. Get current user data to check for email change
      const currentUser = await InternalUserModel.getById(id);
      if (!currentUser) {
        return res.status(404).json({ message: "Internal user not found" });
      }
      const oldEmail = currentUser.Internal_Email.trim(); // Trim to avoid leading/trailing spaces
      const newEmail = updateData.Internal_Email.trim(); // Trim to avoid leading/trailing spaces
      const emailChanged = newEmail && newEmail !== oldEmail;

      // 1.1 Check if the new email already exists for another user
      if (emailChanged) {
        const existingUserWithNewEmail = await InternalUserModel.getByEmail(newEmail);
        // Check if a user was found AND if that user is not the current user being updated
        if (existingUserWithNewEmail && existingUserWithNewEmail.Internal_ID !== id) {
          return res.status(409).json({ message: "El correo electrónico ya está registrado por otro usuario." });
        }
      }


      // Si en los datos a actualizar viene un nuevo tipo de perfil...
      if (updateData.Internal_Type) {
          // ...buscamos su ID correspondiente.
          const profile = await Profiles.findOne({ where: { Profile_Name: updateData.Internal_Type } });
          if (!profile) {
              return res.status(400).json({ message: `El perfil '${updateData.Internal_Type}' no es válido.` });
          }
          // Y lo añadimos a los datos a actualizar.
          updateData.Profile_ID = profile.Profile_ID;
      }




      // 2. Perform the update
      const updatedInternalUser = await InternalUserModel.update(
        id,
        updateData,
        internalId // Pass the ID of the user performing the update for auditing/logging if needed in the model
      );

      if (!updatedInternalUser) {
        return res.status(404).json({ message: "Internal user not found or update failed" });
      }

      // 3. Send email notification if email was changed successfully
      if (emailChanged) {
        try {

          // Configure nodemailer transporter
          const transporter = createEmailTransporter();

          // Email options
          const mailOptions = {
            from: `"Support Balanza Web" <${EMAIL_USER}>`,
            to: newEmail, // Send to the new email address
            subject: "📧 Tu correo electrónico ha sido actualizado en Balanza Web",
            html: `
              <html>
                <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <table width="600" border="0" cellspacing="0" cellpadding="20" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                          <tr>
                            <td align="center" style="border-bottom: 1px solid #e0e0e0; padding-bottom: 20px;">
                              <h1 style="color: #0056b3; margin: 0;">Actualización de Correo Electrónico</h1>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-top: 20px;">
                              <p style="color: #333333; line-height: 1.6;">Hola ${updatedInternalUser.Internal_Name},</p>
                              <p style="color: #333333; line-height: 1.6;">Te informamos que el correo electrónico asociado a tu cuenta en <strong>Balanza Web</strong> ha sido actualizado.</p>
                              <div style="background-color: #eef5ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 5px 0; color: #333;"><strong>Nuevo Correo:</strong> ${newEmail}</p>
                              </div>
                              <p style="color: #555555; line-height: 1.6;">Si tú realizaste este cambio, puedes ignorar este mensaje.</p>
                              <p style="color: #d9534f; line-height: 1.6;"><strong>Si no reconoces esta actividad, por favor, contacta a soporte inmediatamente.</strong></p>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #888888;">
                              <p>Saludos cordiales,<br>El equipo de Consultorios Jurídicos PUCE</p>
                              <p>&copy; ${new Date().getFullYear()} Balanza Web. Todos los derechos reservados.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
              </html>
            `,
          };

          // Send the email
          await transporter.sendMail(mailOptions);
          console.log(`Correo de notificación de cambio de email enviado a ${newEmail}`);

        } catch (emailError) {
          console.error(`Error al enviar notificación de cambio de email a ${newEmail}:`, emailError);
          // Decide how to handle email failure: Log it but still return success for the update?
          // Or return a specific status indicating update success but email failure?
          // For now, just log it. The user update was successful.
        }
      }

      // 4. Return the updated user data
      return res.json(updatedInternalUser);

    } catch (error) {
      console.error("Error al actualizar el usuario interno:", error);
      // Check for specific database errors if needed (e.g., unique constraint violation if email must be unique)
      // The check above handles the specific case of changing to an existing email.
      // This catch block can handle other potential errors like database connection issues.
      if (error.name === 'SequelizeUniqueConstraintError') { // This might still be relevant if the model itself enforces uniqueness on update
          return res.status(409).json({ message: "Error de restricción única al actualizar.", error: error.message });
      }
      return res.status(500).json({ message: "Error interno del servidor al actualizar el usuario.", error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const internalId = req.headers["internal-id"];
      const deletedInternalUser = await InternalUserModel.delete(
        id,
        internalId
      );
      if (!deletedInternalUser)
        return res.status(404).json({ message: "Internal user not found" });

      return res.json({
        message: "Internal user deleted",
        internalUser: deletedInternalUser,
      });
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
        Internal_Password: z
          .string()
          .min(1, { message: "La contraseña es obligatoria" }),
      });

      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorMessages = parseResult.error.errors
          .map((err) => err.message)
          .join(", ");
        return res.status(400).json({ message: errorMessages });
      }

      const { Internal_Email, Internal_Password } = parseResult.data;

      // Autenticar usuario
      const token = await InternalUserModel.authenticate(
        Internal_Email,
        Internal_Password
      );
      if (!token) {
        return res
          .status(401)
          .json({ message: "Usuario o contraseña incorrectos" });
      }
      if (token.status === "inactive") {
        // Mensaje específico para usuario inactivo
        return res
          .status(403)
          .json({ message: "El usuario se encuentra inactivo." });
      }

      return res
        .cookie("access_token", token, {
          httpOnly: true,
          sameSite: false,
          secure: false, // En producción, cambiar a true para que funcione solo en HTTPS
          maxAge: 6 * 60 * 60 * 1000, // 6 horas
        })
        .json({ token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async logout(req, res) {
    return res
      .clearCookie("access_token")
      .json({ message: "Logout successful" });
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
      const transporter = createEmailTransporter();

      // Enviar el correo con el código
      const mailOptions = {
        from: `"Support Balanza Web" <${EMAIL_USER}>`,
        to: email,
        subject: "🔒 Código para reiniciar contraseña",
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
              `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error al enviar email:", error);
          return res
            .status(500)
            .json({ message: "Error al enviar el correo.", error });
        }
        return res
          .status(200)
          .json({
            message:
              "En caso de estar registrado este email, se enviará un código de verificación.",
          });
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message: "Error al solicitar el código",
          error: error.message,
        });
    }
  }

  //verifyCode: Verifica si el código de reseteo es válido
  static async verifyCode(req, res) {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res
          .status(400)
          .json({ message: "Email y código son obligatorios" });
      }

      const isValid = await InternalUserModel.verifyResetCode(email, code);
      if (!isValid) {
        return res.status(400).json({ message: "Código inválido o expirado" });
      }

      return res.status(200).json({ message: "Código válido" });
    } catch (error) {
      return res
        .status(500)
        .json({
          message: "Error al verificar el código",
          error: error.message,
        });
    }
  }

  //resetPassword: Cambia la contraseña del usuario, recibiendo el email, el código y la nueva contraseña (Usando el código de reseteo)
  static async resetPassword(req, res) {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios" });
      }

      // Verificar código antes de permitir el cambio de contraseña
      const isValid = await InternalUserModel.verifyResetCode(email, code);
      if (!isValid) {
        return res.status(400).json({ message: "Código inválido o expirado" });
      }

      // Actualizar contraseña
      const updated = await InternalUserModel.updatePassword(
        email,
        newPassword
      );
      if (!updated) {
        return res
          .status(400)
          .json({ message: "Error al actualizar la contraseña" });
      }

      // Eliminar el código de reseteo usado
      await InternalUserModel.deleteResetCode(email);

      return res
        .status(200)
        .json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      return res
        .status(500)
        .json({
          message: "Error al restablecer la contraseña",
          error: error.message,
        });
    }
  }

  /** 🔹 Actualizar la huella del usuario */
  static async actualizarHuella(req, res) {
    try {
      const { usuarioCedula, template } = req.body;
      const internalId = req.headers['internal-id'];
      
      if (!usuarioCedula || !template) {
        return res
          .status(400)
          .json({ message: "Cédula y huella son requeridas." });
      }

      // 🔹 Llamamos al modelo para actualizar la huella
      const usuarioActualizado = await InternalUserModel.updateHuella(
        usuarioCedula,
        template,
        internalId
      );

      if (!usuarioActualizado) {
        return res
          .status(404)
          .json({ message: "Usuario no encontrado o no se pudo actualizar." });
      }

      res.json({
        message: "Huella actualizada correctamente.",
        usuario: usuarioActualizado,
      });
    } catch (error) {
      console.error("Error al actualizar huella:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  }

  static async createInternalUsersBulk(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const periodId = req.params.periodId;
      const internalId = req.headers["internal-id"]; // Obtener el Internal_ID desde los encabezados
      const records = Array.isArray(req.body) ? req.body : [req.body];

      const internalUserSchema = z
        .object({
          Internal_ID: z.string().min(1, { message: "El ID es obligatorio" }),
          Internal_Name: z
            .string()
            .min(1, { message: "El nombre es obligatorio" }),
          Internal_LastName: z
            .string()
            .min(1, { message: "El apellido es obligatorio" }),
          Internal_Email: z.string().optional(),
          Internal_Password: z.string().optional(),
          Internal_Type: z
            .string()
            .min(1, { message: "El tipo es obligatorio" }),
          Internal_Area: z
            .string()
            .min(1, { message: "El área es obligatoria" }),
          Internal_Phone: z.string().optional(),
          Internal_Status: z
            .string()
            .min(1, { message: "El estado es obligatorio" }),
          Internal_Huella: z.any().optional().nullable(),
        })
        .passthrough();

      const usersToCreate = [];
      const userXPeriodToCreate = [];
      const emailsToSend = []; // Para enviar correos después

      for (const record of records) {
        const parseResult = internalUserSchema.safeParse(record);
        if (!parseResult.success) {
          const errorMessages = parseResult.error.errors
            .map((err) => err.message)
            .join(", ");
          throw new Error(`Error en registro: ${errorMessages}`);
        }

        const data = parseResult.data;

        // --- BUSCAR EL PROFILE_ID ---
        // 1. Buscamos el perfil en la BD usando el nombre que llegó.
        const profile = await Profiles.findOne({ where: { Profile_Name: data.Internal_Type } });

        // 2. Si no se encuentra, devolvemos un error.
        if (!profile) {
          await transaction.rollback();
          return res.status(400).json({ message: `El perfil '${data.Internal_Type}' no es válido para el usuario ${data.Internal_ID}.` });
        }

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
          Profile_ID: profile.Profile_ID, // Agregar el Profile_ID encontrado
          Internal_Area: data.Internal_Area,
          Internal_Phone: data.Internal_Phone || null,
          Internal_Status: data.Internal_Status,
          Internal_Huella: data.Internal_Huella || null,
        });

        if (periodId && periodId !== "sin-periodo") {
          userXPeriodToCreate.push({
            Period_ID: periodId,
            Internal_ID: data.Internal_ID,
          });
        }

        // Guardamos para enviar correo solo si NO es temporal
        if (!data.Internal_Email.endsWith("@temporal.local")) {
          emailsToSend.push({
            to: data.Internal_Email,
            password: plainPassword,
            name: data.Internal_Name, // Agregar el nombre para personalizar el email
          });
        }
      }

      // 🔹 1. Crear usuarios en transaction
      await InternalUserModel.bulkCreateUsers(usersToCreate, internalId, { transaction }); // Pasar el Internal_ID al modelo
      
      await transaction.commit(); // Confirmamos transacción de usuarios primero

      // 🔹 1.5 Crear asignaciones de período SIN transacción anidada (el modelo maneja su propia transacción)
      if (userXPeriodToCreate.length > 0) {
        await UserXPeriodModel.create(userXPeriodToCreate);
      }

      // 🔹 2. Enviar correos después de confirmar la transacción
      const transporter = createEmailTransporter();
      
      // Contador de éxitos y fallos
      let emailsSent = 0;
      let emailsFailed = 0;
      const failedEmails = [];

      // Verificar conexión del transporter
      try {
        await transporter.verify();
        console.log('✓ Servidor de correo listo para enviar mensajes');
      } catch (verifyError) {
        console.error('✗ Error verificando servidor de correo:', verifyError);
        return res.status(201).json({ 
          message: "Usuarios creados correctamente, pero hay problemas con el servidor de correo. No se enviaron notificaciones.",
          warning: "Servidor de correo no disponible"
        });
      }

      // Función auxiliar para delay entre envíos
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      for (const emailInfo of emailsToSend) {
        const mailOptions = {
          from: `"Support Balanza Web" <${EMAIL_USER}>`,
          to: emailInfo.to,
          subject: "¡Bienvenido/a a Balanza Web! Tus Credenciales de Acceso",
          html: `
      <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="20" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td align="center" style="border-bottom: 1px solid #e0e0e0; padding-bottom: 20px;">
                      <h1 style="color: #0056b3; margin: 0;">¡Bienvenido/a, ${emailInfo.name}!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 20px;">
                      <p style="color: #333333; line-height: 1.6;">Estamos encantados de tenerte en <strong>Balanza Web</strong>.</p>
                      <p style="color: #333333; line-height: 1.6;">Aquí tienes tus credenciales para acceder a la plataforma:</p>
                      <div style="background-color: #eef5ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0; color: #333;"><strong>Correo Electrónico:</strong> ${emailInfo.to}</p>
                        <p style="margin: 5px 0; color: #333;"><strong>Contraseña Temporal:</strong> ${emailInfo.password}</p>
                      </div>
                      <p style="color: #555555; line-height: 1.6;"><strong>Importante:</strong> Por tu seguridad, te recomendamos encarecidamente que cambies tu contraseña la primera vez que inicies sesión.</p>
                      <p style="color: #555555; line-height: 1.6;">Puedes hacerlo fácilmente:</p>
                      <ol style="color: #555555; line-height: 1.6; padding-left: 20px;">
                        <li>Inicia sesión con las credenciales proporcionadas.</li>
                        <li>Haz clic en tu <strong>Perfil</strong> (ubicado en la esquina inferior izquierda).</li>
                        <li>Selecciona la opción de <strong>Configuración</strong></li>
                        <li>Desplaza el cursor hacia abajo y encontrarás la opción para poder cambiar tu contraseña.</li>
                      </ol>
                      <p style="color: #333333; line-height: 1.6;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar a soporte.</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #888888;">
                      <p>Saludos cordiales,<br>El equipo de Consultorios Jurídicos PUCE</p>
                      <p>&copy; ${new Date().getFullYear()} Balanza Web. Todos los derechos reservados.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
      `,
        };
      
        try {
          // Intentar enviar el correo con reintentos
          let attempts = 0;
          let sent = false;
          
          while (attempts < 3 && !sent) {
            try {
              await transporter.sendMail(mailOptions);
              console.log(`✓ Correo enviado exitosamente a ${emailInfo.to}`);
              emailsSent++;
              sent = true;
            } catch (sendError) {
              attempts++;
              if (attempts < 3) {
                console.log(`⚠ Reintentando envío a ${emailInfo.to} (intento ${attempts}/3)...`);
                await delay(2000); // Esperar 2 segundos antes de reintentar
              } else {
                throw sendError; // Si fallan los 3 intentos, lanzar error
              }
            }
          }
          
          // Delay entre correos exitosos para evitar rate limiting
          if (emailsToSend.indexOf(emailInfo) < emailsToSend.length - 1) {
            await delay(1500); // 1.5 segundos entre cada correo
          }
          
        } catch (errorEmail) {
          emailsFailed++;
          failedEmails.push(emailInfo.to);
          console.error(`✗ Error al enviar correo a ${emailInfo.to}:`, errorEmail.message);
        }
      }
      
      // Cerrar el transporter
      transporter.close();
      
      // Respuesta con resumen del envío
      const summary = {
        message: "Proceso de creación de usuarios completado",
        usersCreated: usersToCreate.length,
        emailsSent: emailsSent,
        emailsFailed: emailsFailed
      };
      
      if (failedEmails.length > 0) {
        summary.failedEmails = failedEmails;
        summary.warning = "Algunos correos no pudieron ser enviados";
      }
      
      return res.status(201).json(summary);
      
        } catch (error) {
          console.error("Error en createInternalUsersBulk:", error);
          await transaction.rollback();
          return res.status(500).json({ error: error.message });
        }
      }

      static async resendCredentials(req, res) {
        try {
          const { internalId } = req.params;
          const { newEmail } = req.body;

          console.log("Resend credentials for ID:", internalId, "to email:", newEmail);
      
          if (!internalId || !newEmail) {
            return res.status(400).json({ message: "Faltan datos: ID o email." });
          }
      
          // Buscar usuario
          const user = await InternalUserModel.getById(internalId);
          if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
          }
      
          // Generar nueva contraseña
          const newPassword = generateRandomPassword(8);
          console.log("Generated password: ", newPassword);
          const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      
        // Actualizar correo y contraseña
        await InternalUserModel.updateResendCredentials(internalId, newEmail, newPassword);

      
          // Enviar correo con las nuevas credenciales
          const transporter = createEmailTransporter();
      
          const mailOptions = {
            from: `"Soporte Balanza Web" <${EMAIL_USER}>`,
            to: newEmail,
            subject: "Tus nuevas credenciales",
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>🎓 Tus credenciales han sido actualizadas</h2>
                <p>Se ha actualizado tu correo electrónico. Estas son tus nuevas credenciales:</p>
                <p><strong>Correo:</strong> ${newEmail}</p>
                <p><strong>Contraseña:</strong> ${newPassword}</p>
                <p>Por favor, ingresa al sistema y cambia tu contraseña cuanto antes.</p>
                <p>Saludos,<br/>Equipo Balanza Web</p>
              </div>
            `
          };
      
          await transporter.sendMail(mailOptions);
          return res.status(200).json({ message: "Correo enviado con nuevas credenciales." });
      
        } catch (error) {
          console.error("Error en resendCredentials:", error);
          return res.status(500).json({ message: "Error al enviar credenciales", error: error.message });
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
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios" });
      }

      // Verificar la contraseña actual
      const isValid = await InternalUserModel.authenticate(
        email,
        currentPassword
      );
      if (!isValid) {
        return res
          .status(400)
          .json({ message: "Contraseña actual incorrecta" });
      }

      // Actualizar la contraseña
      const updated = await InternalUserModel.updatePassword(
        email,
        newPassword
      );
      if (!updated) {
        return res
          .status(400)
          .json({ message: "Error al actualizar la contraseña" });
      }

      return res
        .status(200)
        .json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      return res
        .status(500)
        .json({
          message: "Error al cambiar la contraseña",
          error: error.message,
        });
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
        return res
          .status(400)
          .json({ message: "No se ha subido ningún archivo." });
      }

      // --- 1. Get current user data to find the old picture URL ---
      const currentUser = await InternalUserModel.getById(userId);
      const oldPictureUrl = currentUser?.Internal_Picture;
      let oldPublicId = null;

      if (oldPictureUrl && oldPictureUrl.includes("res.cloudinary.com")) {
        try {
          // Extract public_id (including folder) from the old URL
          const urlParts = oldPictureUrl.split("/");
          // Find the index of 'upload', the public_id parts start 2 indices after it
          const uploadIndex = urlParts.indexOf("upload");
          if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
            const publicIdWithFormat = urlParts
              .slice(uploadIndex + 2)
              .join("/");
            oldPublicId =
              publicIdWithFormat.substring(
                0,
                publicIdWithFormat.lastIndexOf(".")
              ) || publicIdWithFormat; // Remove extension if present
          }
        } catch (e) {
          console.error(
            "Could not parse old public_id from URL:",
            oldPictureUrl,
            e
          );
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
        throw new Error("Error al subir la imagen a Cloudinary");
      }
      const newPictureUrl = result.secure_url;
      const newPublicId = result.public_id;

      // En caso de que el usuario tenga una foto de perfil se la actualiza
      const updated = await InternalUserModel.updateProfilePicture(
        userId,
        newPictureUrl
      );

      if (!updated) {
        // If DB update fails, try to delete the *newly uploaded* image from Cloudinary
        console.error(
          "Database update failed. Attempting to delete newly uploaded image:",
          newPublicId
        );
        try {
          await cloudinary.uploader.destroy(newPublicId);
        } catch (cleanupError) {
          console.error(
            "Failed to cleanup newly uploaded image after DB error:",
            cleanupError
          );
        }
        return res
          .status(500)
          .json({
            message: "No se pudo actualizar la URL en la base de datos.",
          });
      }

      // Si la imagen se subió correctamente y se actualizó la base de datos, eliminamos la imagen anterior
      if (oldPublicId && oldPublicId !== newPublicId) {
        console.log(
          `Database updated. Attempting to delete old image: ${oldPublicId}`
        );
        try {
          await cloudinary.uploader.destroy(oldPublicId);
          console.log(`Successfully deleted old image: ${oldPublicId}`);
        } catch (deleteError) {
          console.error(
            "Failed to delete old profile picture from Cloudinary:",
            oldPublicId,
            deleteError
          );
        }
      }
      return res.status(200).json({
        message: "Foto de perfil actualizada.",
        profilePictureUrl: newPictureUrl, // Devuelvemos la nueva URL
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      return res
        .status(500)
        .json({
          message: "Error interno al subir la imagen.",
          error: error.message,
        });
    }
  }

  static async updateProfilePicture(req, res) {
    try {
      const { userId } = req.params; // Obtener el ID del usuario desde los parámetros de la URL
      const { imageUrl } = req.body; // Obtener la URL de la imagen desde el cuerpo de la solicitud

      if (!userId || !imageUrl) {
        return res
          .status(400)
          .json({ message: "User ID and image URL are required" });
      }

      const updated = await InternalUserModel.updateProfilePicture(
        userId,
        imageUrl
      );
      if (!updated) {
        return res
          .status(404)
          .json({
            message: "User not found or unable to update profile picture",
          });
      }

      return res
        .status(200)
        .json({ message: "Profile picture updated successfully" });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
