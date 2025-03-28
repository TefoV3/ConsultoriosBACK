import { Seguimiento_Semanal } from "../../schemas/schedules_tables/Seguimiento_Semanal_schema.js";
import { Periodo } from "../../schemas/schedules_tables/Periodo_schema.js";

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

    static async getLastSeguimientoByPeriodo(periodoId) {
        try {
            return await Seguimiento_Semanal.findOne({
                where: { Periodo_ID: periodoId, Semana_IsDeleted: false },
                order: [['Semana_Numero', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error al obtener el último seguimiento: ${error.message}`);
        }
    }
    


    static async create(data) {
        try{
            return await Seguimiento_Semanal.create(data);
        } catch (error) {
            throw new Error(`Error al crear seguimiento: ${error.message}`);
        }
    }

    //bulk create
    static async createBulk(data) {
        try{
            return await Seguimiento_Semanal.bulkCreate(data);
        } catch (error) {
            throw new Error(`Error al crear seguimiento: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            // Obtener el seguimiento actual antes de actualizar
            const oldSeguimiento = await this.getById(id);
            if (!oldSeguimiento) return null;
    
            const oldHoras = oldSeguimiento.Semana_Horas || 0;
    
            // Actualizar el registro en Seguimiento_Semanal
            const [rowsUpdated] = await Seguimiento_Semanal.update(data, {
                where: { Semana_ID: id, Semana_IsDeleted: false }
            });
            if (rowsUpdated === 0) return null;
    
            const updatedSeguimiento = await this.getById(id);
            const newHoras = updatedSeguimiento.Semana_Horas || 0;
    
            const diferencia = newHoras - oldHoras;
            if (diferencia !== 0) {
                // Si diferencia es positiva se suma, si es negativa se resta
                if (diferencia > 0) {
                    await Periodo.increment(
                        { Periodo_Total_Horas: diferencia },
                        { where: { Periodo_ID: updatedSeguimiento.Periodo_ID } }
                    );
                } else {
                    await Periodo.decrement(
                        { Periodo_Total_Horas: Math.abs(diferencia) },
                        { where: { Periodo_ID: updatedSeguimiento.Periodo_ID } }
                    );
                }
            }
    
            return updatedSeguimiento;
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