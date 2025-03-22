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
            if (!file) {
                throw new Error("Se requiere un archivo PDF para la evidencia.");
            }

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

    static async update(id, data) {
        try {
            const evidence = await this.getById(id);
            if (!evidence) return null;

            const [rowsUpdated] = await Evidence.update(data, {
                where: { Evidence_ID: id }
            });

            if (rowsUpdated === 0) return null;
            return await this.getById(id);
        } catch (error) {
            throw new Error(`Error updating evidence: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const evidence = await this.getById(id);
            if (!evidence) return null;

            await Evidence.destroy({ where: { Evidence_ID: id } });
            return evidence;
        } catch (error) {
            throw new Error(`Error deleting evidence: ${error.message}`);
        }
    }
}