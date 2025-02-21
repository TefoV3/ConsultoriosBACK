import { UsuarioInterno } from "../schemas/Usuario_interno.js";

export class UsuarioInternoModel {

    static async getAll() {
        try {
            return await UsuarioInterno.findAll();
        } catch (error) {
            throw new Error(`Error al obtener usuarios internos: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await UsuarioInterno.findOne({
                where: { Interno_Cedula: id }
            });
        } catch (error) {
            throw new Error(`Error al obtener usuario interno: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await UsuarioInterno.create(data);
        } catch (error) {
            throw new Error(`Error al crear usuario interno: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const usuarioInterno = await this.getById(id);
            if (!usuarioInterno) return null;

            const [rowsUpdated] = await UsuarioInterno.update(data, {
                where: { Interno_Cedula: id }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error al actualizar usuario interno: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const usuarioInterno = await this.getById(id);
            if (!usuarioInterno) return null;

            await UsuarioInterno.destroy({ where: { Interno_Cedula: id } });
            return usuarioInterno;
        } catch (error) {
            throw new Error(`Error al eliminar usuario interno: ${error.message}`);
        }
    }
}
