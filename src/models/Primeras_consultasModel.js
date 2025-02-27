import { sequelize } from "../database/database.js";
import { PrimerasConsultas } from "../schemas/Primeras_consultas.js";
import { Usuario } from "../schemas/Usuario.js";
import { UsuarioInterno } from "../schemas/Usuario_interno.js";

export class PrimerasConsultasModel {

    static async getAll() {
        try {
            return await PrimerasConsultas.findAll();
        } catch (error) {
            throw new Error(`Error al obtener primeras consultas: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await PrimerasConsultas.findOne({
                where: { Prim_Codigo: id }
            });
        } catch (error) {
            throw new Error(`Error al obtener primera consulta: ${error.message}`);
        }
    }

    static async createPrimerasConsultas(data) {
        const t = await sequelize.transaction();
        let usuarioCreado = false;
        
        try {
            // 1️⃣ Verificar si el usuario ya existe, si no, crearlo con todos sus atributos
            let usuario = await Usuario.findOne({ where: { Usuario_Cedula: data.Usuario_Cedula }, transaction: t });
            if (!usuario) {
                usuario = await Usuario.create({
                    Usuario_Cedula: data.Usuario_Cedula,
                    Usuario_Nombres: data.Usuario_Nombres,
                    Usuario_Apellidos: data.Usuario_Apellidos,
                    Usuario_Correo: data.Usuario_Correo,
                    Usuario_Telefono: data.Usuario_Telefono,
                    Usuario_Genero: data.Usuario_Genero,
                    Usuario_Etnia: data.Usuario_Etnia,
                    Usuario_Instruccion: data.Usuario_Instruccion,
                    Usuario_Ocupacion: data.Usuario_Ocupacion,
                    Usuario_Direccion: data.Usuario_Direccion,
                    Usuario_Nacionalidad: data.Usuario_Nacionalidad,
                    Usuario_CargasFamiliares: data.Usuario_CargasFamiliares,
                    Usuario_Sector: data.Usuario_Sector,
                    Usuario_Zona: data.Usuario_Zona,
                    Usuario_EstadoCivil: data.Usuario_EstadoCivil,
                    Usuario_Discapacidad: data.Usuario_Discapacidad,
                    Usuario_Bono: data.Usuario_Bono,
                    Usuario_FechaNacimiento: data.Usuario_FechaNacimiento,
                    Usuario_NivelDeIngresos: data.Usuario_NivelDeIngresos,
                    Usuario_Edad: data.Usuario_Edad,
                    Usuario_Ingresos_familiares: data.Usuario_Ingresos_familiares,
                    Usuario_CasaPropia: data.Usuario_CasaPropia,
                    Usuario_AutoPropio: data.Usuario_AutoPropio,
                    Usuario_NombreReferencia: data.Usuario_NombreReferencia,
                    Usuario_TelReferencia: data.Usuario_TelReferencia
                }, { transaction: t });
                usuarioCreado = true; // ✅ Marca que el usuario fue creado en esta transacción
            }

           

            // 2️⃣ Verificar si el abogado/coordinador ya existe en UsuarioInterno
            /*
            let usuarioInterno = await UsuarioInterno.findOne({ where: { Interno_Cedula: data.Interno_Cedula }, transaction: t });
            if (!usuarioInterno) {
                usuarioInterno = await UsuarioInterno.create({
                    Interno_Cedula: data.Interno_Cedula,
                    Interno_Nombre: data.Interno_Nombre_Completo
                }, { transaction: t });
            }
            */

            // 3️⃣ Crear el registro en Primeras Consultas
            const nuevaConsulta = await PrimerasConsultas.create({
                Prim_Codigo: data.Prim_Codigo,
                Interno_Cedula: data.Interno_Cedula,
                Usuario_Cedula: data.Usuario_Cedula,
                Prim_TipoCliente: data.Prim_TipoCliente,
                Prim_Fecha: data.Prim_Fecha,
                Prim_Materia: data.Prim_Materia,
                Prim_Abogado: data.Prim_Abogado,
                Prim_Provincia: data.Prim_Provincia,
                Prim_Observaciones: data.Prim_Observaciones,
                Prim_Consultorio: data.Prim_Consultorio,
                Prim_Tema: data.Prim_Tema,
                Prim_Derivacion: data.Prim_Derivacion,
                Prim_Estado: data.Prim_Estado,
                Prim_Ciudad: data.Prim_Ciudad,
            }, { transaction: t });

            await t.commit();
            return { message: "Primera consulta creada correctamente", data: nuevaConsulta };
        } catch (error) {
            await t.rollback();
            if (usuarioCreado) {
                await Usuario.destroy({ where: { Usuario_Cedula: data.Usuario_Cedula } });
            }
            throw new Error(`Error al crear primera consulta: ${error.message}`);

        }
    }


    /*
    static async create(data) {
        try {
            return await PrimerasConsultas.create(data);
        } catch (error) {
            throw new Error(`Error al crear primera consulta: ${error.message}`);
        }
    }

    
    static async create(data) {
        const userData = { /* extract user data from data  };
        try {
            const newUser = await UsuarioModel.create(userData);
            if (!newUser) throw new Error("User creation failed");
    
            const consultaData = { ...data, userId: newUser.Usuario_Cedula }; // Assuming userId is needed
            return await PrimerasConsultas.create(consultaData);
        } catch (error) {
            throw new Error(`Error al crear primera consulta: ${error.message}`);
        }
    }
    */

    static async update(id, data) {
        try {
            const consulta = await this.getById(id);
            if (!consulta) return null;

            const [rowsUpdated] = await PrimerasConsultas.update(data, {
                where: { Prim_Codigo: id }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error al actualizar primera consulta: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const consulta = await this.getById(id);
            if (!consulta) return null;

            await PrimerasConsultas.destroy({ where: { Prim_Codigo: id } });
            return consulta;
        } catch (error) {
            throw new Error(`Error al eliminar primera consulta: ${error.message}`);
        }
    }
}
