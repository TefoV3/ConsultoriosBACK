import { UsuarioXPeriodo } from "../../schemas/schedules_tables/UsuarioXPeriodo_schema.js";
import { InternalUser } from "../../schemas/Internal_User.js";	
import { Periodo } from "../../schemas/schedules_tables/Periodo_schema.js";

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
                        attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area", "Internal_Huella"]
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

    static async getUsuariosAndPeriodosByPeriodo(periodoId) {
        try {
            return await UsuarioXPeriodo.findAll({
                where: { Periodo_ID: periodoId, UsuarioXPeriodo_IsDeleted: false },
                include: [
                    {
                        model: InternalUser,
                        as: "usuario",
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

    static async create(data) {
        try {
            return await UsuarioXPeriodo.bulkCreate(data);
        } catch (error) {
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
