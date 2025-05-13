import { Field_Of_Activity } from "../../schemas/parameter_tables/Field_Of_Activity.js";
// Corregido: Importar Type_Of_Activity en lugar de Subject
import { Type_Of_Activity } from "../../schemas/parameter_tables/Type_Of_Activity.js";

export class Field_Of_Activity_Model {

    static async getAll() {
        try {
            return await Field_Of_Activity.findAll({
                where: { Field_Of_Activity_Status: true },
                include: {
                    model: Type_Of_Activity, // Usar el modelo importado correctamente
                    as: 'type_of_activity', // Alias definido en el schema (asegúrate que coincida)
                    attributes: ['Type_Of_Activity_Name'] // Atributos a incluir
                }
            });
        } catch (error) {
            // Considera usar un nombre más descriptivo en el mensaje si es posible
            throw new Error(`Error retrieving Fields Of Activity: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Field_Of_Activity.findOne({
                where: { Field_Of_Activity_ID: id, Field_Of_Activity_Status: true },
                include: {
                    model: Type_Of_Activity, // Usar el modelo importado correctamente
                    as: 'type_of_activity', // Alias definido en el schema
                    attributes: ['Type_Of_Activity_Name'] // Atributos a incluir
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving Field Of Activity: ${error.message}`);
        }
    }

    static async create(data) {
        try {
            return await Field_Of_Activity.create(data);
        } catch (error) {
            throw new Error(`Error creating Field Of Activity: ${error.message}`);
        }
    }
    static async bulkCreate(data) {
        try {
            return await Field_Of_Activity.bulkCreate(data);
        } catch (error) {
            throw new Error(`Error bulk creating Fields Of Activity: ${error.message}`);
        }
    }

    // Corregido: Renombrado y ajustado para Type_Of_Activity
    static async getByTypeOfActivityId(typeOfActivityId) {
        try {
            // Asegúrate que 'Type_Of_Activity_FK' sea el nombre correcto de la clave foránea en tu schema Field_Of_Activity_
            return await Field_Of_Activity.findAll({
                where: { Type_Of_Activity_FK: typeOfActivityId, Field_Of_Activity_Status: true },
                 include: { // Opcional: Incluir Type_Of_Activity si necesitas el nombre también aquí
                    model: Type_Of_Activity,
                    as: 'type_of_activity',
                    attributes: ['Type_Of_Activity_Name']
                }
            });
        } catch (error) {
            // Corregido: Mensaje de error más específico
            throw new Error(`Error retrieving Fields Of Activity by Type Of Activity ID: ${error.message}`);
        }
    }

    static async getByTypeOfActivityIdAndStatus(typeOfActivityId, status) {
        try {
            return await Field_Of_Activity.findAll({
                where: {
                    Type_Of_Activity_FK: typeOfActivityId,
                    Field_Of_Activity_Status: status
                }
            });
        } catch (error) {
            throw new Error(`Error retrieving fields of activity: ${error.message}`);
        }
    }

    static async update(id, data) {
        try {
            // Reutiliza getById para asegurar que el registro existe y está activo
            const record = await this.getById(id);
            if (!record) return null; // Ya incluye la lógica de status y el include

            // Actualiza el registro
            const [rowsUpdated] = await Field_Of_Activity.update(data, {
                where: { Field_Of_Activity_ID: id, Field_Of_Activity_Status: true } // Doble check de status por si acaso
            });

            if (rowsUpdated === 0) {
                 // Podría ocurrir si hay una condición de carrera o si el estado cambió entre getById y update
                 console.warn(`Field Of Activity update for ID ${id} reported 0 rows updated despite record found.`);
                 return null; // O re-obtener para confirmar el estado actual
            }

            // Devuelve el registro actualizado con la relación incluida
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating Field Of Activity: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            // Reutiliza getById para obtener el registro antes de "eliminarlo"
            const record = await this.getById(id);
            if (!record) return null;

            // Realiza el soft delete
            const [rowsUpdated] = await Field_Of_Activity.update(
                { Field_Of_Activity_Status: false },
                { where: { Field_Of_Activity_ID: id, Field_Of_Activity_Status: true } } // Asegura que solo actualizas si aún está activo
            );

             if (rowsUpdated === 0) {
                 console.warn(`Field Of Activity soft delete for ID ${id} reported 0 rows updated despite record found.`);
                 // Podrías retornar null o el registro original encontrado si la actualización falló
                 return null;
            }

            // Retorna el registro como estaba *antes* de marcarse como inactivo
            // Opcionalmente, podrías re-consultar si necesitas confirmar el cambio,
            // pero usualmente se retorna el objeto encontrado para indicar qué se "eliminó".
            return record;
        } catch (error) {
            throw new Error(`Error deleting Field Of Activity: ${error.message}`);
        }
    }
}
