import { Evidencia } from "../schemas/Evidencia_schema.js";

export class EvidenciaModel {

    static async getAll() {
        try {
            return await Evidencia.findAll();
        } catch (error) {
            throw new Error(`Error al obtener evidencias: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Evidencia.findOne({
                where: { Id_Evidencia: id }
            });
        } catch (error) {
            throw new Error(`Error al obtener evidencia: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Evidencia.create(data);
        } catch (error) {
            throw new Error(`Error al crear evidencia: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            const evidencia = await this.getById(id);
            if (!evidencia) return null;

            const [rowsUpdated] = await Evidencia.update(data, {
                where: { Id_Evidencia: id }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error al actualizar evidencia: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const evidencia = await this.getById(id);
            if (!evidencia) return null;

            await Evidencia.destroy({ where: { Id_Evidencia: id } });
            return evidencia;
        } catch (error) {
            throw new Error(`Error al eliminar evidencia: ${error.message}`);
        }
    }
}
