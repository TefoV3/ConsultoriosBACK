import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { UsuarioInternoModel } from '../models/Usuario_internoModel.js';
import { ResetPassword } from '../schemas/ResetPassword.js';
import { EMAIL_USER } from '../config.js';
import { EMAIL_PASS } from '../config.js';
import { SALT_ROUNDS } from '../config.js';
/**
 * METODO PARA SOLICITAR EL CAMBIO DE CONTRASEÑA (SE VERIFICA QUE EL USUARIO EXISTA Y SE ENVIA UN CODIGO DE VERIFICACION)
 * Solicita el código de reinicio de contraseña.
 * Recibe { email } en el body.
 * Si el usuario existe, genera un código de 6 dígitos, lo almacena en la tabla ResetPassword
 * con una expiración de 15 minutos, y envía un correo con el código.
 */
export class ResetPasswordController{
    static async requestResetPassword(req, res) {
        try {
          const { email } = req.body;
          if (!email) {
            return res.status(400).json({ message: "El email es obligatorio" });
          }
      
          // Buscar el usuario por correo
          const user = await UsuarioInternoModel.getByCorreo(email);
          if (!user) {
            //si no existe el usuario, no se debe dar pistas al usuario, pero si debe haber un mensaje de error
            return res.status(400).json({ message: "El email no está registrado" });
          }
      
          // Generar un código numérico de 6 dígitos
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
      
          // Elimina cualquier código previo para este usuario
          await ResetPassword.destroy({ where: { userId: user.Interno_Cedula } });
      
          // Guarda el código en la base de datos
          await ResetPassword.create({
            userId: user.Interno_Cedula,
            code,
            expires,
          });
      
          // Configurar el transporte de correo (ajusta según tu proveedor)
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: EMAIL_USER, 
              pass: EMAIL_PASS,
            }
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
          return res.status(500).json({ message: error.message });
        }
      }

      //METODO CHECKRESETCODE
      //Verifica que el código exista y sea el correcto

      static async checkResetCode(email, code) {
        if (!email || !code) {
          throw new Error("El email y el código son obligatorios");
        }
        // Buscar al usuario por correo
        const user = await UsuarioInternoModel.getByCorreo(email);
        if (!user) {
          throw new Error("Usuario no encontrado");
        }
        // Buscar el registro del código en la tabla ResetPassword
        const resetRecord = await ResetPassword.findOne({
          where: { userId: user.Interno_Cedula, code }
        });
        if (!resetRecord) {
          throw new Error("El código no es válido");
        }
        // Verificar que el código no haya expirado
        if (resetRecord.expires < new Date()) {
          throw new Error("El código ha expirado");
        }
        return user;
      }
      

      //Llama a la función checkResetCode y retorna un mensaje de éxito (para usar en el frontend)

      static async verifyCode(req, res) {
        try {
          const { email, code } = req.body;
          // En lugar de this.checkResetCode, usa ResetPasswordController.checkResetCode
          await ResetPasswordController.checkResetCode(email, code);
          return res.status(200).json({ message: "Código válido" });
        } catch (error) {
          return res.status(400).json({ message: error.message });
        }
      }
      

      /**
     * Reinicia la contraseña utilizando el código enviado.
     * Recibe { email, code, newPassword } en el body.
     * Verifica que el código exista y no haya expirado, y actualiza la contraseña del usuario.
     */

      static async resetPassword(req, res) {
        try {
          const { email, code, newPassword } = req.body;
          if (!email || !code || !newPassword) {
            return res.status(400).json({ message: "El email, el código y la nueva contraseña son obligatorios" });
          }
      
          // Verificar que el código sea válido
          const user = await ResetPasswordController.checkResetCode(email, code);
      
        // Dentro de resetPasswordWithCode en el controlador:
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        user.Interno_Password = hashedPassword;

        // Guardar los cambios en la instancia (usando save)
        await user.save();

        // Eliminar el registro del código
        await ResetPassword.destroy({ where: { userId: user.Interno_Cedula, code } });
      
          return res.status(200).json({ message: "Contraseña actualizada correctamente" });
        } catch (error) {
          return res.status(500).json({ message: error.message });
        }
    }

}
