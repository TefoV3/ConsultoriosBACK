import { Evidence } from "../schemas/Evidences.js";
import { AuditModel } from "../models/AuditModel.js";
import { sequelize } from "../database/database.js";

export class EvidenceModel {

    static async getAll() {
        try {
            return await Evidence.findAll();
        } catch (error) {
            throw new Error(`Error retrieving evidence: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await Evidence.findOne({
                where: { Evidence_ID: id }
            });
        } catch (error) {
            throw new Error(`Error retrieving evidence: ${error.message}`);
        }
    }

    static async create(data, file) {
        const t = await sequelize.transaction();

        try {

            // Guardar la evidencia en la base de datos
            const newEvidence = await Evidence.create({
                Internal_ID: data.Internal_ID,
                Init_Code: data.Init_Code,
                Evidence_Name: data.Evidence_Name || file.originalname,
                Evidence_Document_Type: file.mimetype,
                Evidence_URL: null, // Se usa NULL ya que el PDF está en BLOB
                Evidence_Date: new Date(),
                Evidence_File: file ? file.buffer : null  // Guardar el archivo en formato BLOB
            }, { transaction: t });

            // Registrar en Audit
            await AuditModel.registerAudit(
                data.Internal_ID,
                "INSERT",
                "Evidences",
                `El usuario interno ${data.Internal_ID} subió la evidencia ${newEvidence.Evidence_ID} para la consulta ${data.Init_Code}`
            );

            await t.commit();
            return newEvidence;
        } catch (error) {
            await t.rollback();
            throw new Error(`Error al subir la evidencia: ${error.message}`);
        }
    }

    static async getEvidenceById(id) {
        try {
            return await Evidence.findByPk(id);
        } catch (error) {
            throw new Error(`Error al obtener la evidencia: ${error.message}`);
        }
    }

    static async update(id, data, internalId) {
        try {
            const record = await this.getById(id);
                        if (!record) return null;
            
                        const [rowsUpdated] = await SocialWork.update(data, { where: { SW_ProcessNumber: id } });
            
                        if (rowsUpdated === 0) return null;
                        
                        // 🔹 Registrar en auditoría la actualización
                        await AuditModel.registerAudit(
                            internalId,
                            "UPDATE",
                            "SocialWork",
                            `El usuario interno ${internalId} actualizó el registro de evidencia con ID ${id}`
                        );
            
                        return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating evidence: ${error.message}`);
        }
    }

    static async delete(id, internalId) {
        try {
            const evidences = await this.getById(id);
                        if (!evidences) return null;
            
                        await Evidence.destroy({ where: { Evidence_ID: id } });
            
                        // 🔹 Registrar en Audit que un usuario interno eliminó una consulta inicial
                        await AuditModel.registerAudit(
                            internalId, 
                            "DELETE",
                            "Initial_Consultations",
                            `El usuario interno ${internalId} eliminó la evidencia ${id}`
                        );
            
                        return evidences;
        } catch (error) {
            throw new Error(`Error deleting evidence: ${error.message}`);
        }
    }
}