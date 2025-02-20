import { PrimerasConsultas } from "../schemas/PrimerasConsultas_schema.js";

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

    static async create(data) {
        try {
            return await PrimerasConsultas.create(data);
        } catch (error) {
            throw new Error(`Error al crear primera consulta: ${error.message}`);
        }
    }

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
