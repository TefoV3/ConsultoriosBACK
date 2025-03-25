import { Seguimiento_Semanal } from "../../schemas/schedules_tables/Seguimiento_Semanal_schema.js";

export class Seguimiento_SemanalModel {

    static async getSeguimientos() {
        try{
            return await Seguimiento_Semanal.findAll({ where: { Semana_IsDeleted: false } });
        } catch (error) {
            throw new Error(`Error al obtener seguimientos: ${error.message}`);
        }
    }

    static async getById(id) {
        try{
            return await Seguimiento_Semanal.findOne({
                where: { Semana_ID: id, Semana_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error al obtener seguimiento: ${error.message}`);
        }
    }

    static async create(data) {
        try{
            return await Seguimiento_Semanal.create(data);
        } catch (error) {
            throw new Error(`Error al crear seguimiento: ${error.message}`);
        }
    }

    static async update(id, data) {
        try{
            const seguimiento = await this.getById(id);

            if (!seguimiento) return null;

            const [rowsUpdated] = await Seguimiento_Semanal.update(data, {
                where: { Semana_ID: id, Semana_IsDeleted: false }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error al actualizar seguimiento: ${error.message}`);
        }
    }

    static async delete(id) {
        try{
            const seguimiento = await this.getById(id);

            if (!seguimiento) return null;

            await Seguimiento_Semanal.update(
                { Semana_IsDeleted: true },
                { where: { Semana_ID: id, Semana_IsDeleted: false } }
            );
            return seguimiento;
        } catch (error) {
            throw new Error(`Error al eliminar seguimiento: ${error.message}`);
        }
    }
}