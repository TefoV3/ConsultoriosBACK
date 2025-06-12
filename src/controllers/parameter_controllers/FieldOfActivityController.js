import { Field_Of_Activity_Model } from '../../models/parameter_models/Field_Of_ActivityModel.js';
// Opcional: Importar un schema de validación si usas librerías como Zod o Joi
// import { fieldOfActivitySchema, fieldOfActivityUpdateSchema } from '../../schemas/validation/fieldOfActivityValidation.js';

export class FieldOfActivityController {

    static async getAll(req, res) {
        try {
            const fieldsOfActivity = await Field_Of_Activity_Model.getAll();
            res.status(200).json(fieldsOfActivity);
        } catch (error) {
            console.error(error); // Es buena práctica mantener el log del error en el servidor
            res.status(500).json({ error: error.message }); // Alineado con TopicController
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const fieldOfActivity = await Field_Of_Activity_Model.getById(id);
            if (!fieldOfActivity) {
                // Alineado con TopicController
                return res.status(404).json({ message: "Field Of Activity not found" });
            }
            res.status(200).json(fieldOfActivity);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message }); // Alineado con TopicController
        }
    }

    // Adaptado de getBySubjectId en TopicController
    static async getByTypeOfActivityId(req, res) {
        try {
            const { typeOfActivityId } = req.params; // Asegúrate que la ruta capture este parámetro

            // Validación opcional (buena práctica)
            if (isNaN(parseInt(typeOfActivityId))) {
                 return res.status(400).json({ message: "Invalid Type Of Activity ID provided." });
            }

            const fieldsOfActivity = await Field_Of_Activity_Model.getByTypeOfActivityId(typeOfActivityId);

            // A diferencia de getById, si no se encuentran registros para una FK,
            // devolver un array vacío con status 200 es lo correcto, no un 404.
            // TopicController devolvía 404, pero lo ajustamos aquí para ser más preciso.
            res.status(200).json(fieldsOfActivity);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message }); // Alineado con TopicController
        }
    }

    static async getByTypeOfActivityIdAndStatus(req, res) {
        try {
            const { typeOfActivityId } = req.params;
    
            // Validación básica
            if (isNaN(parseInt(typeOfActivityId))) {
                return res.status(400).json({ message: "Invalid Type Of Activity ID provided." });
            }
    
            const fieldsOfActivity = await Field_Of_Activity_Model.getByTypeOfActivityIdAndStatus(typeOfActivityId, 1);
    
            if (!fieldsOfActivity || fieldsOfActivity.length === 0) {
                return res.status(404).json({ message: "No fields of activity found for the given Type Of Activity ID and status." });
            }
    
            res.status(200).json(fieldsOfActivity);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            // Opcional: Validación con Schema (como en el ejemplo anterior)
            // const validationResult = ...; if (!validationResult.success) ...
            const internalId = req.headers["internal-id"]

            // Lógica para manejar creación individual o masiva, como en TopicController
            if (Array.isArray(req.body)) {
                // Validación básica para bulk (como en el ejemplo anterior)
                if (req.body.length === 0) {
                    return res.status(400).json({ message: "Request body must be a non-empty array for bulk creation." });
                }
                // Opcional: Validar cada item del array con schema

                const createdFieldsOfActivity = await Field_Of_Activity_Model.bulkCreate(req.body, internalId);
                return res.status(201).json(createdFieldsOfActivity);
            } else {
                // Validación básica para creación individual (como en el ejemplo anterior)
                if (!req.body || !req.body.Type_Of_Activity_FK || !req.body.Field_Of_Activity_Name) {
                    return res.status(400).json({ message: "Missing required fields (e.g., Type_Of_Activity_FK, Field_Of_Activity_Name)" });
                }
                // Opcional: Validar el objeto individual con schema

                const newFieldOfActivity = await Field_Of_Activity_Model.create(req.body, internalId);
                res.status(201).json(newFieldOfActivity);
            }
        } catch (error) {
            console.error(error);
            // Manejo específico de errores de FK (buena práctica)
            if (error.name === 'SequelizeForeignKeyConstraintError') {
                 return res.status(400).json({ message: "Invalid Type Of Activity ID provided." });
            }
            res.status(500).json({ error: error.message }); // Alineado con TopicController
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            // Opcional: Validación con Schema (como en el ejemplo anterior)
            // const validationResult = ...; if (!validationResult.success) ...
            const internalId = req.headers["internal-id"]

            // Validación básica (como en el ejemplo anterior)
            if (!req.body || Object.keys(req.body).length === 0) {
               return res.status(400).json({ message: "Request body must contain data to update." });
           }

            const updatedFieldOfActivity = await Field_Of_Activity_Model.update(id, req.body, internalId);
            if (!updatedFieldOfActivity) {
                // Alineado con TopicController
                return res.status(404).json({ message: "Field Of Activity not found or no changes made" });
            }
            res.status(200).json(updatedFieldOfActivity);
        } catch (error) {
            console.error(error);
             // Manejo específico de errores de FK (buena práctica)
             if (error.name === 'SequelizeForeignKeyConstraintError') {
                 return res.status(400).json({ message: "Invalid Type Of Activity ID provided for update." });
            }
            res.status(500).json({ error: error.message }); // Alineado con TopicController
        }
    }

    static async delete(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const { id } = req.params;
            const deletedFieldOfActivity = await Field_Of_Activity_Model.delete(id, internalId);
            if (!deletedFieldOfActivity) {
                // Alineado con TopicController
                return res.status(404).json({ message: "Field Of Activity not found" });
            }
            // Devuelve el objeto eliminado (soft delete), como en TopicController
            res.status(200).json(deletedFieldOfActivity);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message }); // Alineado con TopicController
        }
    }
}
