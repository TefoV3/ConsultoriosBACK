import { Caso } from "../schemas/Caso.js";

export class CasoModel {

    static async getAll() {
        try {
            return await Caso.findAll({ where: { Caso_IsDeleted: false } });
        } catch (error) {
            throw new Error(`Error al obtener casos: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Caso.findOne({
                where: { Caso_Codigo: id, Caso_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error al obtener caso: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Caso.create(data);
        } catch (error) {
            throw new Error(`Error al crear caso: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const caso = await this.getById(id);
            if (!caso) return null;

            const [rowsUpdated] = await Caso.update(data, {
                where: { Caso_Codigo: id, Caso_IsDeleted: false }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error al actualizar caso: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const caso = await this.getById(id);
            if (!caso) return null;

            await Caso.update(
                { Caso_IsDeleted: true },
                { where: { Caso_Codigo: id, Caso_IsDeleted: false } }
            );
            return caso;
        } catch (error) {
            throw new Error(`Error al eliminar caso: ${error.message}`);
        }
    }
}
