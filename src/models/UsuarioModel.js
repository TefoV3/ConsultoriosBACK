import { Usuario } from "../schemas/Usuario_schema.js";

export class UsuarioModel {

    static async getAll() {
        try {
            return await Usuario.findAll({ where: { Usuario_IsDeleted: false } });
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Usuario.findOne({
                where: { Usuario_Cedula: id, Usuario_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error al obtener usuario: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Usuario.create(data);
        } catch (error) {
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const usuario = await this.getById(id);
            if (!usuario) return null;

            const [rowsUpdated] = await Usuario.update(data, {
                where: { Usuario_Cedula: id, Usuario_IsDeleted: false }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error al actualizar usuario: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const usuario = await this.getById(id);
            if (!usuario) return null;

            await Usuario.update(
                { Usuario_IsDeleted: true },
                { where: { Usuario_Cedula: id, Usuario_IsDeleted: false } }
            );
            return usuario;
        } catch (error) {
            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    }
}
