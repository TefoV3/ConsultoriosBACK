import { SocialWork } from "../schemas/SocialWork.js";
import { AuditModel } from "./AuditModel.js"; // Para registrar en auditoría
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { User } from "../schemas/User.js";
import { getUserId } from '../sessionData.js';
import ExcelJs from "exceljs";
import { width } from "pdfkit/js/page";

export class SocialWorkModel {
    // Obtener todas las evaluaciones de trabajo social
    static async getAll() {
        try {
            return await SocialWork.findAll();
        } catch (error) {
            throw new Error(`Error retrieving social work records: ${error.message}`);
        }
    }

    // New method to get all users with social work records
    static async getAllUsersWithSocialWork() {
        try {
            // We're querying from User and including necessary relations
            const users = await User.findAll({
                include: [
                    {
                        model: InitialConsultations,
                        required: true, // Only include users that have an initial consultation
                        include: [
                            {
                                model: SocialWork,
                                required: true // Only include initial consultations that have social work records
                            }
                        ]
                    }
                ]
            });
            
            // Log the structure of the first user for debugging
            if (users.length > 0) {
                console.log("Sample user data structure:", JSON.stringify({
                    userId: users[0].User_ID,
                    firstName: users[0].User_FirstName,
                    consultations: users[0].Initial_Consultations ? 
                      users[0].Initial_Consultations.length : 'none',
                    firstConsultationId: users[0].Initial_Consultations && 
                      users[0].Initial_Consultations.length > 0 ? 
                      users[0].Initial_Consultations[0].Init_Code : 'none',
                    socialWorkId: users[0].Initial_Consultations && 
                      users[0].Initial_Consultations.length > 0 && 
                      users[0].Initial_Consultations[0].SocialWork ? 
                      users[0].Initial_Consultations[0].SocialWork.SW_ProcessNumber : 'none'
                }, null, 2));
            }
            
            return users;
        } catch (error) {
            console.error("Error in getAllUsersWithSocialWork:", error);
            throw new Error(`Error retrieving users with social work records: ${error.message}`);
        }
    }
    
    // Obtener una evaluación de trabajo social por ID
    static async getById(id) {
        try {
            // Retrieve the social work record with related data
            const socialWorkRecord = await SocialWork.findOne({
                where: { SW_ProcessNumber: id },
                include: [
                    {
                        model: InitialConsultations,
                        attributes: ["User_ID", "Init_Subject"],
                        include: [
                            {
                                model: User,
                                attributes: [
                                    "User_ID",
                                    "User_FirstName",
                                    "User_LastName",
                                    "User_Age",
                                    "User_MaritalStatus",
                                    "User_Profession",
                                    "User_Phone"
                                ]
                            }
                        ]
                    }
                ]
            });
    
            // Return the raw database record or null if not found
            return socialWorkRecord || null;
        } catch (error) {
            console.error("Error in getById:", error);
            throw new Error(`Error retrieving social work record: ${error.message}`);
        }
    }

    // Obtener User_ID desde SocialWork a través de Init_Code
    static async getUserIdBySocialWork(initCode) {
        try {
            const socialWorkRecord = await SocialWork.findOne({
                where: { Init_Code: initCode },
                include: [
                    {
                        model: InitialConsultations,
                        attributes: ["User_ID"],
                        include: [
                            {
                                model: User,
                                attributes: ["User_ID", "User_FirstName", "User_LastName", "User_Email"]
                            }
                        ]
                    }
                ]
            });

            if (!socialWorkRecord || !socialWorkRecord.Initial_Consultation) {
                return null;
            }

            return socialWorkRecord.Initial_Consultation.User;
        } catch (error) {
            throw new Error(`Error retrieving User_ID from SocialWork using Init_Code ${initCode}: ${error.message}`);
        }
    }
    static async getSocialWorkById(socialWorkId) {
        try {
            const socialWork = await SocialWork.findOne({
                where: { SW_ProcessNumber: socialWorkId },
                include: [
                    {
                        model: InitialConsultations,
                        attributes: ["User_ID"],
                        include: [
                            {
                                model: User,
                                attributes: ["User_ID", "User_FirstName", "User_LastName"]
                            }
                        ]
                    }
                ]
            });
    
            return socialWork; // Return the result or null if not found
        } catch (error) {
            console.error("Error fetching social work by ID:", error);
            throw new Error("Database error when fetching social work");
        }
    }
    // Crear una evaluación de trabajo social
    static async create(data, req, internalUser) {
        try {
            // 🔹 Obtener `Internal_ID` desde el middleware
            const internalId = internalUser || getUserId();
            
            

            // 🔹 Verificar si el `Init_Code` existe en la tabla `InitialConsultations`
            const initialConsultation = await InitialConsultations.findOne({ 
                where: { Init_Code: data.Init_Code } 
            });

            if (!initialConsultation) {
                throw new Error(`No existe una consulta inicial con Init_Code ${data.Init_Code}`);
            }

            // 🔹 Crear el registro en `SocialWork`
            const newRecord = await SocialWork.create({
                Init_Code: data.Init_Code,
                SW_UserRequests: data.SW_UserRequests || null,
                SW_ReferralAreaRequests: data.SW_ReferralAreaRequests || null,
                SW_ViolenceEpisodes: data.SW_ViolenceEpisodes || null,
                SW_Complaints: data.SW_Complaints || null,
                SW_DisabilityType: data.SW_DisabilityType || null,
                SW_DisabilityPercentage: data.SW_DisabilityPercentage || null,
                SW_HasDisabilityCard: data.SW_HasDisabilityCard || false,
                SW_Status: data.SW_Status || "Activo"
            });

            // 🔹 Registrar en auditoría
            await AuditModel.registerAudit(
                internalId,
                "INSERT",
                "SocialWork",
                `El usuario interno ${internalId} creó el registro de trabajo social con ID ${newRecord.SW_ProcessNumber}`
            );

            return newRecord;
        } catch (error) {
            throw new Error(`Error creating social work record: ${error.message}`);
        }
    }

    // Actualizar una evaluación de trabajo social
    static async update(id, data, internalUser) {
        try {
            const record = await this.getById(id);
            if (!record) return null;

            const internalId = internalUser || getUserId();
            const [rowsUpdated] = await SocialWork.update(data, { where: { SW_ProcessNumber: id } });

            if (rowsUpdated === 0) return null;
            
            // 🔹 Registrar en auditoría la actualización
            await AuditModel.registerAudit(
                internalId,
                "UPDATE",
                "SocialWork",
                `El usuario interno ${internalId} actualizó el registro de trabajo social con ID ${id}`
            );

            return await this.getById(id);
        } catch (error) {
          throw new Error(`Error updating social work record: ${error.message}`);
        }
      }
      static async updateStatus(socialWorkId, status, status_observations) {
        try {
            // First check if the record exists
            const record = await this.getById(socialWorkId);
            
            if (!record) {
                return false;
            }
            
            // Fix: Corrected parameter name from status_obvervations to status_observations
            const [rowsUpdated] = await SocialWork.update(
                {
                    SW_Status: status,
                    SW_Status_Observations: status_observations
                },
                {
                    where: { SW_ProcessNumber: socialWorkId }
                }
            );
    
            return rowsUpdated > 0; // Return true if at least one row was updated
        } catch (error) {
            console.error("Error updating social work status:", error);
            throw new Error("Database error when updating social work status");
        }
    }

    // Eliminar (borrado lógico) una evaluación de trabajo social
    static async delete(id, internalUser) {
        try {
            const record = await this.getById(id);
            if (!record) return null;
            
            const internalId = internalUser || getUserId();
            await SocialWork.update({ SW_Status: false }, { where: { SW_ProcessNumber: id } });

            // 🔹 Registrar en auditoría la eliminación (borrado lógico)
            await AuditModel.registerAudit(
                internalId,
                "DELETE",
                "SocialWork",
                `El usuario interno ${internalId} eliminó lógicamente el registro de trabajo social con ID ${id}`
            );

            return record;
        } catch (error) {
            throw new Error(`Error deleting social work record: ${error.message}`);
        }
    }


    static async generateExcelReport(startDate, endDate) {
        try {
            // Fetch data from SocialWork and related LivingGroup table
            const socialWorkRecords = await SocialWork.findAll({
                where: {
                    SW_EntryDate: {
                        [Op.between]: [startDate, endDate],
                    },
                },
                include: [
                    {
                        model: LivingGroup, // Assuming LivingGroup is associated with SocialWork
                        attributes: ["LG_Name", "LG_Relationship", "LG_Age", "LG_Occupation","LG_Notes"], // Add relevant fields
                    },
                ],
            });

            // Create a new Excel workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Social Work Report");

            // Define the header row
            worksheet.columns = [
                { header: "Numero de Proceso", key: "SW_ProcessNumber", width: 20 },
                { header: "Fecha de ingreso", key: "SW_EntryDate", width: 20 },
                { header: "Status", key: "SW_Status", width: 25 },
                { header: "Codigo de Consultas Iniciales", key: "Init_Code", width: 25 },
                { header: "Pedido del Usuario", key: "SW_UserRequests", width: 30 },
                { header: "Pedido del Área de remisión", key: "SW_ReferralAreaRequests", width: 30 },
                { header: "Lugar del Trabajo", key: "SW_WorkPlace", width: 20 },
                { header: "Dirección Domiciliaria", key: "SW_HomeAddress", width: 30 },
                // Miembros del círculo familiar con discapacidad
                { header: "Teléfono de referencia", key: "SW_ReferencePhone", width: 20 },
                { header: "Tipo de discapacidad", key: "SW_DisabilityType", width: 20 },
                { header: "Porcentaje de discapacidad", key: "SW_DisabilityPercentage", width: 20 },
                { header: "Tiene carnet de discapacidad", key: "SW_HasDisabilityCard", width: 25 },
                { header: "Episodios de Violencia", key: "SW_ViolenceEpisodes", width: 20 },
                { header: "Denuncias", key: "SW_Complaints", width: 20 },
                { header: "Consumo de Alcohol", key: SW_AlcoholConsumption, width: 20 },
                { header: "Consumo de Drogas", key: SW_DrugConsumption, width: 20 },
                // Situación económica
                { header: "Ingresos", key: SW_Income, width: 20 },
                { header: "Vivienda", key: SW_HousingType, width: 20 },
                // Datos de la contraparte
                { header: "Nombres y Apellidos", key: "SW_CounterpartName", width: 30 },
                { header: "Edad", key: "SW_CounterpartAge", width: 10 },
                { header: "Estado Civil", key: "SW_CounterpartMaritalStatus", width: 20 },
                { header: "Ocupación", key: "SW_CounterpartOccupation", width: 20 },
                { header: "Dirección Domiciliaria", key: "SW_CounterpartAddress", width: 30 },
                { header: "Teléfono", key: "SW_CounterpartPhone", width: 20 },
                { header: "C.I", key: "SW_CounterpartID", width: 20 },
                { header: "Relación con el usuario", key: "SW_CounterpartRelation", width: 30 },
                { header: "Caso conocido por otra institución", key: "SW_PreviouslyKnownCase", width: 30 },
                // Relato de los hechos
                { header: "Notas", key: "SW_Notes", width: 30 },
                // Observaciones
                { header: "Observaciones", key: "SW_Observations", width: 30 },
                // Composición de grupo de convivencia
                { header: "Nombres y Apellidos", key: "LG_Name", width: 30 },
                { header: "Edad", key: "LG_Age", width: 10 },
                { header: "Parentesco", key: "LG_Relationship", width: 20 },
                { header: "Ocupación", key: "LG_Occupation", width: 20 },
                { header: "Notas", key: "LG_Notes", width: 30 }
            ];

            // Populate the worksheet with data
            socialWorkRecords.forEach((record) => {
                const livingGroup = record.LivingGroups || []; // Assuming LivingGroups is the alias for the relation

                // Add a row for each LivingGroup entry
                if (livingGroup.length > 0) {
                    livingGroup.forEach((lg) => {
                        worksheet.addRow({
                            SW_ProcessNumber: record.SW_ProcessNumber,
                            SW_EntryDate: record.SW_EntryDate,
                            SW_Status: record.SW_Status,
                            Init_Code: record.Init_Code,
                            LG_Name: lg.LG_Name,
                            LG_Relationship: lg.LG_Relationship,
                            LG_Age: lg.LG_Age,
                            LG_Occupation: lg.LG_Occupation,
                            LG_Notes: lg.LG_Notes,
                        });
                    });
                } else {
                    // Add a row with only SocialWork data if no LivingGroup is associated
                    worksheet.addRow({
                        SW_ProcessNumber: record.SW_ProcessNumber,
                        SW_EntryDate: record.SW_EntryDate,
                        SW_Status: record.SW_Status,
                        Init_Code: record.Init_Code,
                    });
                }
            });

            // Generate the Excel file as a buffer
            const buffer = await workbook.xlsx.writeBuffer();
            return buffer;
        } catch (error) {
            console.error("Error generating Excel report:", error);
            throw new Error(`Error generating Excel report: ${error.message}`);
        }
    }
    
}