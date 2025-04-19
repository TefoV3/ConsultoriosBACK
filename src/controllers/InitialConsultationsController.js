import { InitialConsultationsModel } from "../models/InitialConsultationsModel.js";
import { AssignmentModel } from "../models/AssignmentModel.js";
import { UserModel } from "../models/UserModel.js";
import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config.js"; 
import moment from 'moment-timezone'; // Import moment-timezone

export class FirstConsultationsController {
    static async getFirstConsultations(req, res) {
        try {
            const consultations = await InitialConsultationsModel.getAll();
            res.json(consultations);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const consultation = await InitialConsultationsModel.getById(id);
            if (consultation) return res.json(consultation);
            res.status(404).json({ message: "First consultation not found" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async findById(req, res) {
        const { id } = req.params;
        try {
            const consultation = await InitialConsultationsModel.findById(id);
            if (consultation) return res.json(consultation);
            res.status(404).json({ message: "First consultation not found" });
        }
        catch (error) {
            res.status(500).json(error);
        }
    }

    static async getByStatus(req, res) {
        const { status } = req.params;
        try {
            const consultations = await InitialConsultationsModel.getByStatus(status);
            res.json(consultations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getByUserId(req, res) {
        const { userId } = req.params;
        try {
            const consultations = await InitialConsultationsModel.getByUserId(userId);
            res.json(consultations);
        }
        catch (error) {
            res.status(500).json(error);
        }
    }

    static async getByInitTypeAndSubjectAndStatus(req, res) {
        try {
            const { initSubject, initType, initStatus } = req.params;
    
            if (!initType || !initStatus) {
                return res.status(400).json({ message: "initType and initStatus are required" });
            }
    
            const consultations = await InitialConsultationsModel.getByInitTypeAndSubjectCases(initType, initSubject, initStatus);
            res.status(200).json(consultations);
        } catch (error) {
            res.status(500).json({ message: "Error fetching consultations", error });
        }
    }

    static async getByTypeAndStatus(req, res) {
        try {
            const { initType, initStatus } = req.params;
    
            if (!initType || !initStatus) {
                return res.status(400).json({ message: "initType and initStatus are required" });
            }
    
            const consultations = await InitialConsultationsModel.getByTypeAndStatus(initType, initStatus);
            res.status(200).json(consultations);
        } catch (error) {
            res.status(500).json({ message: "Error fetching consultations", error });
        }
    }



    static async createFirstConsultations(req, res) {
        try {
            console.log("📂 Archivos recibidos:", req.files);
            const internalId = req.headers["internal-id"];  // ✅ Se obtiene el usuario interno desde los headers
    
            // Crear un objeto con los archivos recibidos
            const files = {
                evidenceFile: req.files?.evidenceFile ? req.files.evidenceFile[0] : null,
                healthDocuments: req.files?.healthDocuments ? req.files.healthDocuments[0] : null
            };
    
            // 🔹 Llamar al método del modelo pasando los archivos correctamente
            const newConsultation = await InitialConsultationsModel.createInitialConsultation(req.body, files, internalId);
    
            res.status(201).json({ message: "Consulta inicial creada", data: newConsultation });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    static async createNewConsultation(req, res) {
        try {
            const internalId = req.headers["internal-id"];
            // if (!internalId) {
            //     return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
            // }

            const newConsultation = await InitialConsultationsModel.createNewConsultation(req.body, internalId);

            res.status(201).json({ message: "Consulta inicial creada", data: newConsultation });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];  // ✅ Se obtiene el usuario interno desde los headers

            const updatedConsultation = await InitialConsultationsModel.update(id, req.body, internalId);

            if (!updatedConsultation) return res.status(404).json({ message: "Consulta inicial no encontrada" });

            return res.json(updatedConsultation);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"];  // ✅ Se obtiene el usuario interno desde los headers
            const deletedConsultation = await InitialConsultationsModel.delete(id, internalId);

            if (!deletedConsultation) return res.status(404).json({ message: "Consulta inicial no encontrada" });

            return res.json({ message: "Consulta inicial eliminada", data: deletedConsultation });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async generateAttentionSheet(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: "El parámetro 'id' es obligatorio." });
            }
    
            const consultation = await InitialConsultationsModel.findById(id);
            if (!consultation) {
                return res.status(404).json({ message: "Consulta inicial no encontrada" });
            }
    
            // Generar el PDF en memoria usando la función existente
            const pdfBuffer = await InitialConsultationsModel.generateAttentionSheetBuffer(consultation);
            if (!pdfBuffer) {
                return res.status(500).json({ message: "Error generando el PDF" });
            }
    
            console.log(Buffer.isBuffer(pdfBuffer)); // Verifica que sea un Buffer
    
            // Actualizar el campo Init_AttentionSheet con el nuevo PDF
            await InitialConsultationsModel.update(id, { Init_AttentionSheet: pdfBuffer });
    
            // Enviar el PDF al front-end para visualizar
            res.set({
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="FichaDeAtencion_${id}.pdf"`,
                "Content-Length": pdfBuffer.length,
            });
            return res.send(pdfBuffer);
        } catch (error) {
            console.error("Error generando la ficha de atención:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    static async automaticMailToRejectCase(req, res) {
        try {
            const { id } = req.body; // Asegúrate de que el id esté correctamente extraído
            if (!id) {
                return res.status(400).json({ message: "El 'id' es obligatorio." });
            }
    
            const consultation = await InitialConsultationsModel.getById(id);
            if (!consultation) {
                throw new Error("Consulta inicial no encontrada.");
            }
    
            const user = await UserModel.getById(consultation.User_ID);
            if (!user) {
                throw new Error("Usuario no encontrado.");
            }
    

            const userName = user.User_FirstName;
            const userLastName = user.User_LastName;
            const subject = consultation.Init_Subject;
            const date = new Date(consultation.Init_Date).toLocaleDateString("es-EC", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });
            const mail = user.User_Email;
            if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
                return res.status(400).json({ message: "El correo electrónico del destinatario no es válido." });
            }
    
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: { user: EMAIL_USER, pass: EMAIL_PASS },
            });
    
            const alertNote = consultation.Init_AlertNote || "";
            const strongTagsContent = alertNote.match(/<strong>(.*?)<\/strong>/gi)?.map(tag =>
                tag.replace(/<\/?strong>/gi, "").trim()
            ) || [];
            
            // Realizamos ambas transformaciones en un solo paso
            strongTagsContent.forEach((tag, index) => {
                // Eliminamos las comas y reemplazamos ":" por un salto de línea
                strongTagsContent[index] = tag
                    .replace(/,/g, " ")  // Reemplazamos todas las comas con espacio
                    .replace(/:/g, "\n"); // Reemplazamos los dos puntos con un salto de línea
            });
            

            const mailOptions = {
                from: EMAIL_USER,
                to: mail,
                subject: "Notificación de Rechazo - Consulta Inicial",
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <img src="https://img.icons8.com/color/48/000000/communication.png" alt="Icono Comunicación"/>
                            <h1 style="margin: 10px 0; color:rgb(0, 56, 146);">Notificación</h1>
                        </div>
                        <p>Estimado/a, <strong>${userName} ${userLastName}</strong>,</p>
                        <p style="line-height: 1.6;">
                            Lamentamos informarle que su <strong>consulta inicial</strong> correspondiente a la fecha <strong>${date}</strong>,
                            sobre la materia de <strong>${subject}</strong>, ha sido <strong>rechazada</strong>.
                            Esto se debe a la siguiente razón:
                        </p>
                        <p style="background: #f9f9f9; border-left: 4px solid #d32f2f; padding: 10px 15px; margin: 20px 0;">
                           <strong>${strongTagsContent.join(" ")}</strong>
                        </p>
                        <p style="line-height: 1.6;">
                            Si desea más información o necesita agendar una nueva consulta, estamos a su disposición.
                        </p>
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;"/>
                        <div style="font-size: 0.9em;">
                            <p>Atentamente,</p>
                            <p><strong>CJG de la PUCE</strong></p>
                            <p>📞 Teléfono: +593 (2) 2991783</p>
                            <p>📧 Correo: <a href="mailto:cjg@puce.edu.ec" style="color: rgb(0, 56, 146); text-decoration: none;">cjg@puce.edu.ec</a></p>
                        </div>
                    </div>
                `
            };
    
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error al enviar email:", error);
                    return res.status(500).json({ message: "Error al enviar el correo.", error });
                }
                return res.status(200).json({ message: "Correo enviado exitosamente." });
            });
    
        } catch (error) {
            console.error("Error al enviar el correo:", error);
            return res.status(500).json({ message: `Error al enviar el correo: ${error.message}` });
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
            const excelBuffer = await InitialConsultationsModel.generateExcelReport(queryStartDate, queryEndDate);

            // Configurar headers para la descarga del archivo Excel
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            // Use original startDate and endDate strings for the filename
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="Reporte_Consultas_${startDate}_a_${endDate}.xlsx"`
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
