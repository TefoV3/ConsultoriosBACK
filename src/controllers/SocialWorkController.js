import { SocialWorkModel } from "../models/SocialWorkModel.js";
import { InitialConsultationsModel } from "../models/InitialConsultationsModel.js";

export class SocialWorkController {
    // Obtener todas las evaluaciones
    static async getAll(req, res) {
        try {
            const records = await SocialWorkModel.getAll();
            res.json(records);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // New endpoint for getting all users with social work records
    static async getAllUsersWithSocialWork(req, res) {
        try {
            const records = await SocialWorkModel.getAllUsersWithSocialWork();
            res.json(records);
        } catch (error) {
            console.error("Error fetching users with social work:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // Existing methods...
    static async getById(req, res) {
        const { id } = req.params;
        try {
            const record = await SocialWorkModel.getById(id);
            if (record) return res.json(record);
            res.status(404).json({ message: "Social work record not found" });
        } catch (error) {
            console.error("Error in getById controller:", error);
            res.status(500).json({ error: error.message });
        }
    }   

    // Obtener User_ID desde SocialWork a través de Init_Code
    static async getUserIdBySocialWork(req, res) {
        try {
            const { initCode } = req.params;

            if (!initCode) {
                return res.status(400).json({ error: "Init_Code is required." });
            }

            const user = await SocialWorkModel.getUserIdBySocialWork(initCode);

            if (!user) {
                return res.status(404).json({ message: `No user found for Init_Code ${initCode}.` });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Crear una evaluación de trabajo social
    static async create(req, res) {
        try {
            const { Init_Code } = req.body;
            const internalId = req.headers["internal-id"]

            if (!Init_Code) {
                return res.status(400).json({ error: "El campo 'Init_Code' es obligatorio." });
            }

            const newSocialWork = await SocialWorkModel.create(req.body, req, internalId);

            res.status(201).json({ message: "Registro de trabajo social creado con éxito", data: newSocialWork });
        } catch (error) {
            res.status(500).json({ error: `Error creating social work record: ${error.message}` });
        }
    }

    // Actualizar una evaluación
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { Internal_ID, ...data } = req.body;
            const internalId = req.headers["internal-id"]

            const updatedRecord = await SocialWorkModel.update(id, data, internalId);

            if (!updatedRecord) return res.status(404).json({ message: "Social work record not found" });

            res.json({ message: "Social work record updated successfully", data: updatedRecord });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { id } = req.params; // Extract SocialWork_ID from the request parameters
            const { status, observations } = req.body; // Extract the new status from the request body
    
            if (!status) {
                return res.status(400).json({ error: "Status is required to update the social work record" });
            }
    
            // Update the status in the SocialWork table
            const isUpdated = await SocialWorkModel.updateStatus(id, status, observations);
    
            if (!isUpdated) {
                return res.status(404).json({ message: "Social work record not found or not updated" });
            }
    
            // If the status is "Archivado", update the related InitialConsultations record
            if (status === "Archivado") {
                const socialWorkRecord = await SocialWorkModel.getById(id);
    
                if (socialWorkRecord && socialWorkRecord.Init_Code) {
                    const initCode = socialWorkRecord.Init_Code;
    
                    // Fetch the related InitialConsultation record
                    const initialConsultation = await InitialConsultationsModel.getById(initCode);
    
                    if (initialConsultation && initialConsultation.Init_MandatorySW === true) {
                        // Update Init_Type to "Por Asignar"
                        await InitialConsultationsModel.update(initCode, { Init_Type: "Por Asignar" });
                    }
                }
            }
    
            res.json({ message: "Social work status updated successfully" });
        } catch (error) {
            res.status(500).json({ error: `Error updating social work status: ${error.message}` });
        }
    }

    // Eliminar (borrado lógico) una evaluación
    static async delete(req, res) {
        try {
            const { id } = req.params;
            //const { Internal_ID } = req.body;
            const internalId = req.headers["internal-id"]


            const deletedRecord = await SocialWorkModel.delete(id, internalId);
            if (!deletedRecord) return res.status(404).json({ message: "Social work record not found" });

            res.json({ message: "Social work record deleted (soft delete)", record: deletedRecord });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async generateExcelReport(req, res) {
            try {
                const { startDate, endDate } = req.query;
                const userTimezone = 'America/Guayaquil'; // Or your specific GMT-5 timezone identifier
    
                // Validate dates using moment's strict parsing
                if (!startDate || !endDate || !moment(startDate, 'YYYY-MM-DD', true).isValid() || !moment(endDate, 'YYYY-MM-DD', true).isValid()) {
                    return res.status(400).json({ message: "Fechas de inicio y fin son requeridas en formato YYYY-MM-DD." });
                }
    
                // --- Timezone Correction ---
                const queryStartDate = moment.tz(startDate, 'YYYY-MM-DD', userTimezone).startOf('day').utc().toDate();
                const queryEndDate = moment.tz(endDate, 'YYYY-MM-DD', userTimezone).endOf('day').utc().toDate();
    
    
                // Pass the UTC-adjusted dates to the model
                const excelBuffer = await SocialWorkModel.generateExcelReport(queryStartDate, queryEndDate);
    
                // Configurar headers para la descarga del archivo Excel
                res.setHeader(
                    'Content-Type',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );
                // Use original startDate and endDate strings for the filename
                res.setHeader(
                    'Content-Disposition',
                    `attachment; filename="Reporte_TrabajoSocial_${startDate}_a_${endDate}.xlsx"`
                );
                res.setHeader(
                    'Access-Control-Expose-Headers',
                    'Content-Disposition'
                );
    
                // Enviar el buffer del archivo Excel
                res.send(excelBuffer);
    
            } catch (error) {
                console.error("Error generando el reporte Excel:", error);
                // Ensure error response is always JSON
                if (!res.headersSent) {
                     res.status(500).json({ message: "Error interno al generar el reporte Excel.", error: error.message });
                }
            }
        }
}