import { UsuarioInternoModel } from "../models/Usuario_internoModel.js";
import { z } from "zod";
import { SALT_ROUNDS } from "../config.js";
import { SECRET_JWT_KEY } from "../config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class UsuarioInternoController {
    static async getUsuariosInternos(req, res) {
        try {
            const usuariosInternos = await UsuarioInternoModel.getAll();
            res.json(usuariosInternos);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const usuarioInterno = await UsuarioInternoModel.getById(id);
            if (usuarioInterno) return res.json(usuarioInterno);
            res.status(404).json({ message: "Usuario interno no encontrado" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getByCorreo(req, res) {
        const { correo } = req.params;
        try {
          const usuarioInterno = await UsuarioInternoModel.getByCorreo(correo);
          if (usuarioInterno) {
            return res.json(usuarioInterno);
          } else {
            res.status(404).json({ message: "Usuario interno no encontrado" });
          }
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      }
      

    // Método para crear un usuario, asegurándose de que no haya un usuario con el mismo correo
    static async createUsuarioInterno(req, res) {
        try {
          // Definir el esquema de validación con Zod
          const usuarioInternoSchema = z.object({
            Interno_Cedula: z
              .string()
              .length(10, { message: "La cédula debe tener 10 caracteres" }),
            Interno_Nombre: z.string().min(1, { message: "El nombre es obligatorio" }),
            Interno_Apellido: z.string().min(1, { message: "El apellido es obligatorio" }),
            Interno_Correo: z.string().email({ message: "Correo no válido" }),
            Interno_Password: z.string().min(1, { message: "La contraseña es obligatoria" }),
            Interno_Tipo: z.string().min(1, { message: "El tipo es obligatorio" }),
            Interno_Area: z.string().min(1, { message: "El area es obligatoria" }),
          });
      
          // Validar el request body
          const parseResult = usuarioInternoSchema.safeParse(req.body);
          if (!parseResult.success) {
            const errorMessages = parseResult.error.errors.map((err) => err.message).join(', ');
            return res.status(400).json({ message: errorMessages });
          }
      
          // Extraer los datos validados
          const data = parseResult.data;
      
          // Verificar si ya existe un usuario con esa cédula
          const existingCedula = await UsuarioInternoModel.getById(data.Interno_Cedula);
          if (existingCedula) {
            return res.status(401).json({ message: "Ya existe un usuario con esa cédula" });
          }
      
          // Verificar si ya existe un usuario con ese correo
          const existingEmail = await UsuarioInternoModel.getByCorreo(data.Interno_Correo);
          if (existingEmail) {
            return res.status(401).json({ message: "Ya existe un usuario con ese correo" });
          }
      
          // Hashear la contraseña
          const hashedPassword = await bcrypt.hash(data.Interno_Password, SALT_ROUNDS);
          data.Interno_Password = hashedPassword;
      
          // Crear el usuario
          const usuarioInterno = await UsuarioInternoModel.create(data);
          return res.status(201).json(usuarioInterno);
        } catch (error) {
          return res.status(500).json({ error: error.message });
        }
      }      
      

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedUsuarioInterno = await UsuarioInternoModel.update(id, req.body);
            if (!updatedUsuarioInterno) return res.status(404).json({ message: "Usuario interno no encontrado" });

            return res.json(updatedUsuarioInterno);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedUsuarioInterno = await UsuarioInternoModel.delete(id);
            if (!deletedUsuarioInterno) return res.status(404).json({ message: "Usuario interno no encontrado" });

            return res.json({ message: "Usuario interno eliminado", usuarioInterno: deletedUsuarioInterno });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async login(req, res) {
        try {
          // Definir el esquema de validación con Zod
          const loginSchema = z.object({
            Interno_Correo: z.string().email({ message: "Correo no válido" }),
            Interno_Password: z.string().min(1, { message: "La contraseña es obligatoria" })
          });
      
          // Validar el request body
          const parseResult = loginSchema.safeParse(req.body);
          if (!parseResult.success) {
            const errorMessages = parseResult.error.errors.map(err => err.message).join(', ');
            return res.status(400).json({ message: errorMessages });
          }
      
          // Extraer los datos validados
          const { Interno_Correo, Interno_Password } = parseResult.data;
      
          // Primero, recuperar el usuario por correo (en lugar de intentar logear directamente)
          const usuarioInterno = await UsuarioInternoModel.getByCorreo(Interno_Correo);
          if (!usuarioInterno) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
          }
      
          // Comparar la contraseña ingresada con la contraseña hasheada almacenada
          const isValidPassword = await bcrypt.compare(Interno_Password, usuarioInterno.Interno_Password);
          if (!isValidPassword) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
          }
      
          const token = jwt.sign(
            {
              id: usuarioInterno.Interno_Cedula,
              name: `${usuarioInterno.Interno_Nombre} ${usuarioInterno.Interno_Apellido}`,
              email: usuarioInterno.Interno_Correo,
              type: usuarioInterno.Interno_Tipo,
              area: usuarioInterno.Interno_Area
            },
            SECRET_JWT_KEY,
            { expiresIn: '1h' }
          );
          
          return  res
          .cookie("access_token", token, {
            httpOnly: true, // la cookie solo es accesible por el servidor
            sameSite: false, // permite el acceso desde diferentes dominios
            //6 horas de duración
            maxAge: 6 * 60 * 60 * 1000, // 6 horas
          })
          .json({
               token
          });
        } catch (error) {
          return res.status(500).json({ error: error.message });
        }
      }

    static async logout(req, res) {
        return res.clearCookie("access_token").json({ message: "Logout successful" });
    }

      
      
      
}
