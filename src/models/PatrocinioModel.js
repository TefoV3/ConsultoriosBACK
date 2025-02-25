import { sequelize } from "../database/database.js";

export class PatrocinioModel {
    static async gestionarPatrocinio(operacion, data) {
        try {
            const result = await sequelize.query(
                "CALL GestionarPatrocinio(:operacion, :Prim_Codigo, :Caso_TipoPatrocinio, :Caso_NoCarpeta, :Caso_FechaInicio, :Prim_Materia, :Prim_Tema, :Prim_Servicio, :Caso_Derivacion, :Prim_Consultorio, :Prim_Abogado, :Caso_Provincia, :Caso_Ciudad, :Caso_NoCausa, :Caso_Juicio, :Caso_TipoJudicatura, :Act_NombreJuez, :Caso_TipoCliente, :Act_Ultima_Actividad, :Act_Fecha_Actv, :Act_Estado, :Caso_ResolucionJudicial, :Id_Evidencia, :Caso_Observacion);",
                {
                    replacements: { ...data, operacion },
                    type: sequelize.QueryTypes.RAW
                }
            );
            return result;
        } catch (error) {
            throw new Error(`Error en el procedimiento almacenado: ${error.message}`);
        }
    }
}
