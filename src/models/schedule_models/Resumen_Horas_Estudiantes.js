import { InternalUser } from "../../schemas/Internal_User.js";
import { Resumen_Horas_Estudiantes } from "../../schemas/schedules_tables/Resumen_Horas_Estudiantes_schema.js";

export class Resumen_Horas_EstudiantesModel {

    /** 🔹 Obtener todos los resúmenes activos */
    static async getResumen_Horas_Estudiantes() {
        try {
            return await Resumen_Horas_Estudiantes.findAll({
                where: { Resumen_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error al obtener resúmenes de horas estudiantes: ${error.message}`);
        }
    }

    /** 🔹 Obtener un resumen de horas por ID, solo si no está eliminado */
    static async getById(id) {
        try {
            return await Resumen_Horas_Estudiantes.findOne({
                where: { Resumen_ID: id, Resumen_IsDeleted: false } // ✅ Filtro de eliminación lógica
            });
        } catch (error) {
            throw new Error(`Error al obtener resumen de horas estudiantes: ${error.message}`);
        }
    }

    /** 🔹 Crear un nuevo resumen */
/** 🔹 Crear un nuevo resumen */
static async create(data, options = {}) {
    try {
        return await Resumen_Horas_Estudiantes.create(data, options);
    } catch (error) {
        console.log('Error:', error);
        throw new Error(`Error al crear resumen de horas: ${error.message}`);
    }
}

   /** 🔹 Actualizar un resumen solo si no está eliminado */
   static async update(id, data, options = {}) {
    try {
        const resumen = await this.getById(id, options);
        if (!resumen) return null;
        const [rowsUpdated] = await Resumen_Horas_Estudiantes.update(data, {
            where: { Resumen_ID: id, Resumen_IsDeleted: false },
            ...options
        });
        if (rowsUpdated === 0) return null;
        return await this.getById(id, options);
    } catch (error) {
        throw new Error(`Error al actualizar resumen de horas estudiantiles: ${error.message}`);
    }
}

    /** 🔹 Eliminar (marcar como eliminado) solo si no está eliminado (reutilizando getById) */
    static async delete(id) {
        try {
            const resumen = await this.getById(id); // ✅ Reutiliza getById

            if (!resumen) return null; // 🔹 Si no existe o ya está eliminado

            await Resumen_Horas_Estudiantes.update(
                { Resumen_IsDeleted: true }, // 🔹 Marcar como eliminado
                { where: { Resumen_ID: id, Resumen_IsDeleted: false } } // ✅ Solo si aún no está eliminado
            );

            return await Resumen_Horas_Estudiantes.findOne({ where: { Resumen_ID: id } }); // Retorna el resumen actualizado
        } catch (error) {
            throw new Error(`Error al eliminar resumen de horas estudiantiles: ${error.message}`);
        }
    }

    static async getAllResumenesConEstudiantes() {
        try {
            return await Resumen_Horas_Estudiantes.findAll({
                where: {
                    Resumen_IsDeleted: false
                },
                include: [
                    {
                        model: InternalUser,
                        as: "usuarioResumen",
                        attributes: [
                            "Internal_ID",
                            "Internal_Name",
                            "Internal_LastName",
                            "Internal_Area",
                            "Internal_Email"
                        ],
                        where: {
                            Internal_Status: 'Activo'
                        }
                    }
                ]
            });
        } catch (error) {
            console.error(`❌ Error al obtener todos los resúmenes: ${error.message}`);
            throw new Error(`Error al obtener todos los resúmenes: ${error.message}`);
        }
    }

    static async getResumenConEstudianteByCedula(internalId) {
        try {
            return await Resumen_Horas_Estudiantes.findOne({
                where: {
                    Resumen_IsDeleted: false,
                    Internal_ID: internalId
                },
                include: [
                    {
                        model: InternalUser,
                        as: "usuarioResumen",
                        attributes: [
                            "Internal_ID",
                            "Internal_Name",
                            "Internal_LastName",
                            "Internal_Area",
                            "Internal_Email"
                        ],
                        where: {
                            Internal_Status: 'Activo'
                        }
                    }
                ]
            });
        } catch (error) {
            console.error(`❌ Error al obtener el resumen con estudiante por cédula: ${error.message}`);
            throw new Error(`Error al obtener el resumen con estudiante por cédula: ${error.message}`);
        }
    }
    
    

    static async getResumenConDatosByUser(id) {
        try {
            return await Resumen_Horas_Estudiantes.findOne({
                where: { Internal_ID: id, Resumen_IsDeleted: false },
                include: [
                    {
                        model: InternalUser,
                        as: "usuarioResumen",
                        attributes: [
                            "Internal_ID",
                            "Internal_Name",
                            "Internal_LastName",
                            "Internal_Area",
                            "Internal_Email"
                        ],
                        where: { Internal_Status: "Activo" }
                    }
                ]
            });
        } catch (error) {
            throw new Error(`Error al obtener el resumen con datos del usuario: ${error.message}`);
        }
    }


    /** 🔹 Obtener todos los resúmenes de un usuario */
    static async getResumen_Horas_EstudiantesByUser(id) {
        try {
            return await Resumen_Horas_Estudiantes.findOne({
                where: { Internal_ID: id, Resumen_IsDeleted: false }
            });
        } catch (error) {
            throw new Error(`Error al obtener resúmenes de horas por usuario: ${error.message}`);
        }
    }
    
}
