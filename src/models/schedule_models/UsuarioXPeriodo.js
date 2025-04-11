import { UsuarioXPeriodo } from "../../schemas/schedules_tables/UsuarioXPeriodo_schema.js";
import { InternalUser } from "../../schemas/Internal_User.js";	
import { Periodo } from "../../schemas/schedules_tables/Periodo_schema.js";
import { where } from "sequelize";

export class UsuarioXPeriodoModel {
    static async getUsuarioXPeriodos() {
        try {
            return await UsuarioXPeriodo.findAll({
                where: { UsuarioXPeriodo_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error al obtener usuarioXPeriodo: ${error.message}`);
        }
    }

    static async getById(periodoId, internalId) {
        try {
            return await UsuarioXPeriodo.findOne({
                where: { Periodo_ID: periodoId, Internal_ID: internalId, UsuarioXPeriodo_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error al obtener usuarioXPeriodo: ${error.message}`);
        }
    }

    static async getUsuariosAndPeriodosAll() {
        try {
            return await UsuarioXPeriodo.findAll({
                where: { UsuarioXPeriodo_IsDeleted: false },
                include: [
                    {
                        model: InternalUser,
                        as: "usuario",
                        attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Phone", "Internal_Area", "Internal_Status", "Internal_Type", "Internal_Huella"],
                        where: { Internal_Status: "Activo" } // ✅ Filtro adicional
                    },
                    {
                        model: Periodo,
                        as: "periodo",
                        attributes: ["Periodo_ID", "PeriodoNombre"],
                        where: { Periodo_IsDeleted: false } // ✅ Filtro adicional
                    }
                ]
            });
        } catch (error) {
            console.log(error);
            throw new Error(`Error al obtener usuarios con períodos: ${error.message}`);
        }
    }

    static async getByCedula (cedula) {
        try {
            return await UsuarioXPeriodo.findAll({
                where: { Internal_ID: cedula, UsuarioXPeriodo_IsDeleted: false },
                include: [
                    {
                        model: InternalUser,
                        as: "usuario",  // 📌 Usa el alias definido en UsuarioXPeriodo.js
                        where: {Internal_Status: "Activo"},
                        attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"]
                    },
                    {
                        model: Periodo,
                        as: "periodo",  // 📌 Usa el alias definido en UsuarioXPeriodo.js
                        where: { Periodo_IsDeleted: false }, // ✅ Filtro adicional
                        attributes: ["Periodo_ID", "PeriodoNombre","Periodo_Inicio","Periodo_Fin"]
                    }
                ]
            });
        } catch (error) {
            console.error(`❌ Error al obtener usuarios con períodos: ${error.message}`);
            throw new Error(`Error al obtener usuarios con períodos: ${error.message}`);
        }
    }

    static async getUsuariosAndPeriodosByPeriodo(periodoId) {
        try {
            return await UsuarioXPeriodo.findAll({
                where: { Periodo_ID: periodoId, UsuarioXPeriodo_IsDeleted: false },
                include: [
                    {
                        model: InternalUser,
                        as: "usuario",
                        attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"],
                        where: { Internal_Status: "Activo" } // ✅ Filtro adicional
                    },
                    {
                        model: Periodo,
                        as: "periodo",
                        attributes: ["Periodo_ID", "PeriodoNombre"]
                    }
                ]
            });
        } catch (error) {
            throw new Error(`Error al obtener usuarios con períodos: ${error.message}`);
        }
    }

    static async getByPeriodoAndCedula(periodoId, internalId) {
        try {
            return await UsuarioXPeriodo.findOne({
                where: {
                    Periodo_ID: periodoId,
                    Internal_ID: internalId
                }
            });
        } catch (error) {
            throw new Error(`Error al buscar relación usuario-periodo: ${error.message}`);
        }
    }

    static async getUsuariosByPeriodoAndArea(periodoId, area) {
        try {
            return await UsuarioXPeriodo.findAll({
                where: { Periodo_ID: periodoId, UsuarioXPeriodo_IsDeleted: false },
                include: [
                    {
                        model: InternalUser,
                        as: "usuario",
                        where: { Internal_Area: area },
                        attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"]
                    },
                    {
                        model: Periodo,
                        as: "periodo",
                        attributes: ["Periodo_ID", "PeriodoNombre"]
                    }
                ]
            });
        } catch (error) {
            throw new Error(`Error al obtener usuarios con períodos: ${error.message}`);
        }
    }

    static async getByUsuarioXPeriodoId(usuarioXPeriodoId) {
        try {
          return await UsuarioXPeriodo.findOne({
            where: { 
              UsuarioXPeriodo_ID: usuarioXPeriodoId, 
              UsuarioXPeriodo_IsDeleted: false 
            },
            include: [
              {
                model: InternalUser,
                as: "usuario",
                attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email"],
                where: { Internal_Status: "Activo" } // ✅ Filtro adicional
              },
              {
                model: Periodo,
                as: "periodo",
                attributes: ["Periodo_ID", "PeriodoNombre"],
                where: { Periodo_IsDeleted: false } // ✅ Filtro adicional
              }
            ]
          });
        } catch (error) {
          throw new Error(`Error al obtener usuarioXPeriodo por ID: ${error.message}`);
        }
      }
      

    static async create(data) {
        try {
            // Aseguramos que data sea un array
            const usuarioxPeriodo = Array.isArray(data) ? data : [data];
            const recordsToCreate = [];
            const reactivatedRecords = [];
    
            // Para cada registro que se intenta crear
            for (const item of usuarioxPeriodo) {
                // Buscamos si existe un registro para el mismo período y estudiante
                const existingRecord = await this.getByPeriodoAndCedula(item.Periodo_ID, item.Internal_ID);
                if (existingRecord) {
                    // Si existe y está marcado como eliminado, se reactiva
                    if (existingRecord.UsuarioXPeriodo_IsDeleted) {
                        await UsuarioXPeriodo.update(
                            { UsuarioXPeriodo_IsDeleted: false },
                            { where: { Periodo_ID: item.Periodo_ID, Internal_ID: item.Internal_ID } }
                        );
                        // Re-obtenemos el registro actualizado para incluirlo en el resultado
                        const updatedRecord = await this.getByPeriodoAndCedula(item.Periodo_ID, item.Internal_ID);
                        reactivatedRecords.push(updatedRecord);
                    }
                    // Si existe y no está eliminado, no hacemos nada (ya existe activo)
                } else {
                    // Si no existe, se añade a la lista de creación
                    recordsToCreate.push(item);
                }
            }
    
            let createdRecords = [];
            if (recordsToCreate.length > 0) {
                createdRecords = await UsuarioXPeriodo.bulkCreate(recordsToCreate);
            }
    
            return [...reactivatedRecords, ...createdRecords];
        } catch (error) {
            console.log(error);
            throw new Error(`Error al crear usuarioXPeriodo: ${error.message}`);
        }
    }
    

    static async update(periodoId, internalId, data) {
        try {
            const usuarioXPeriodo = await this.getById(periodoId, internalId);

            if (!usuarioXPeriodo) return null;

            const [rowsUpdated] = await UsuarioXPeriodo.update(data, {
                where: { Periodo_ID: periodoId, Internal_ID: internalId, UsuarioXPeriodo_IsDeleted: false }
            });

            if (rowsUpdated === 0) return null;

            const newPeriodoId = data.Periodo_ID || periodoId;
            const newInternalId = data.Internal_ID || internalId;

            return await this.getById(newPeriodoId, newInternalId);
        } catch (error) {
            throw new Error(`Error al actualizar usuarioXPeriodo: ${error.message}`);
        }
    }

    static async delete(periodoId, internalId) {
        try {
            const usuarioXPeriodo = await this.getById(periodoId, internalId);

            if (!usuarioXPeriodo) return null;

            await UsuarioXPeriodo.update(
                { UsuarioXPeriodo_IsDeleted: true },
                { where: { Periodo_ID: periodoId, Internal_ID: internalId, UsuarioXPeriodo_IsDeleted: false } }
            );

            return await UsuarioXPeriodo.findOne({ where: { Periodo_ID: periodoId, Internal_ID: internalId } });
        } catch (error) {
            throw new Error(`Error al eliminar usuarioXPeriodo: ${error.message}`);
        }
    }
}
