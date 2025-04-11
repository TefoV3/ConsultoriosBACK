import { Periodo } from "../../schemas/schedules_tables/Periodo_schema.js";
import { Seguimiento_Semanal } from "../../schemas/schedules_tables/Seguimiento_Semanal_schema.js";
import { Op } from "sequelize";

export class PeriodoModel {

    /** 🔹 Obtener todos los períodos activos */
    static async getPeriodos() {
        try {
            return await Periodo.findAll({ where: { Periodo_IsDeleted: false } });
        } catch (error) {
            throw new Error(`Error al obtener períodos: ${error.message}`);
        }
    }

    /** 🔹 Obtener un período por ID, solo si no está eliminado */
    static async getById(id) {
        try {
            return await Periodo.findOne({
                where: { Periodo_ID: id, Periodo_IsDeleted: false } // ✅ Filtro de eliminado
            });
        } catch (error) {
            throw new Error(`Error al obtener período: ${error.message}`);
        }
    }

        static async getPeriodoConSeguimientos(periodoId) {
            try {
              return await Periodo.findOne({
                where: { Periodo_ID: periodoId, Periodo_IsDeleted: false },
                include: [
                  {
                    model: Seguimiento_Semanal,
                    as: "seguimientos",
                    where: { Semana_IsDeleted: false },
                    required: false  // Para incluir el período incluso si no tiene seguimientos
                  }
                ]
              });
            } catch (error) {
              throw new Error(`Error al obtener el período con seguimientos: ${error.message}`);
            }
          }

    /** 🔹 Crear un nuevo período */
    static async create(data) {
        try {
            // Verificar que no se cruce con otros períodos existentes
            const conflictos = await Periodo.findOne({
                where: {
                    Periodo_IsDeleted: false,
                    [Op.or]: [
                        {
                            Periodo_Inicio: { [Op.between]: [data.Periodo_Inicio, data.Periodo_Fin] }
                        },
                        {
                            Periodo_Fin: { [Op.between]: [data.Periodo_Inicio, data.Periodo_Fin] }
                        },
                        {
                            Periodo_Inicio: { [Op.lte]: data.Periodo_Inicio },
                            Periodo_Fin: { [Op.gte]: data.Periodo_Fin }
                        }
                    ]
                }
            });

            console.log('Conflictos:', conflictos); // 🔹 Log para depuración
    
            if (conflictos) {
                console.log('Conflictos:', conflictos); // 🔹 Log para depuración
                throw new Error('Ya existe un período que se solapa con las fechas ingresadas.');
            }
    
            return await Periodo.create(data);
        } catch (error) {
            throw new Error(`Error al crear período: ${error.message}`);
        }
    }
    
    static async update(id, data) {
        try {
            const periodo = await this.getById(id);
            if (!periodo) return null;
    
            // Verificar solapamiento con otros períodos, excluyendo el actual
            const conflictos = await Periodo.findOne({
                where: {
                    Periodo_ID: { [Op.ne]: id }, // Excluir el mismo
                    Periodo_IsDeleted: false,
                    [Op.or]: [
                        {
                            Periodo_Inicio: { [Op.between]: [data.Periodo_Inicio, data.Periodo_Fin] }
                        },
                        {
                            Periodo_Fin: { [Op.between]: [data.Periodo_Inicio, data.Periodo_Fin] }
                        },
                        {
                            Periodo_Inicio: { [Op.lte]: data.Periodo_Inicio },
                            Periodo_Fin: { [Op.gte]: data.Periodo_Fin }
                        }
                    ]
                }
            });
    
            if (conflictos) {
                throw new Error('Ya existe otro período que se cruza con las fechas ingresadas.');
            }
    
            const [rowsUpdated] = await Periodo.update(data, {
                where: { Periodo_ID: id, Periodo_IsDeleted: false }
            });
    
            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error al actualizar período: ${error.message}`);
        }
    }

    /** 🔹 Eliminar período (marcado lógico) solo si no está eliminado (reutilizando getById) */
    static async delete(id) {
        try {
            const periodo = await this.getById(id); // ✅ Reutiliza getById para verificar si el período existe

            if (!periodo) return null; // 🔹 Si el período no existe o ya está eliminado

            await Periodo.update(
                { Periodo_IsDeleted: true }, // 🔹 Marcar como eliminado
                { where: { Periodo_ID: id, Periodo_IsDeleted: false } } // ✅ Solo si no está eliminado ya
            );

            return await Periodo.findOne({ where: { Periodo_ID: id } }); // Retorna el período actualizado
        } catch (error) {
            throw new Error(`Error al eliminar período: ${error.message}`);
        }
    }
}
