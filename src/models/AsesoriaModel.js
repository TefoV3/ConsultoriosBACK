import { sequelize } from "../database/database.js";

export class AsesoriaModel {
    
    static async gestionarAsesoria(operacion, data) {
        try {
            const result = await sequelize.query(
                "CALL GestionarAsesoria(:operacion, :Prim_Codigo, :Prim_TipoCliente, :Caso_FechaInicio, :Prim_Materia, :Prim_Abogado, :Caso_Provincia, :Caso_Observacion, :Prim_Consultorio, :Prim_Tema, :Prim_Servicio, :Prim_Derivacion, :Caso_Ciudad, :id_Evidencia);",
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
