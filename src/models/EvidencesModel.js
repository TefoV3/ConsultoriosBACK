import { Evidence } from "../schemas/Evidences.js";
import { AuditModel } from "../models/AuditModel.js";
import { sequelize } from "../database/database.js";

export class EvidenceModel {

  //Hacemos el get all quitando de todos los campos el Evidence_File ya que es un BLOB y no se puede mostrar en el front
  static async getAll() {
    try {
      return await Evidence.findAll({
        attributes: {
          exclude: ["Evidence_File"],
        },
      });
    } catch (error) {
      throw new Error(`Error retrieving evidences: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      return await Evidence.findOne({
        where: { Evidence_ID: id },
      });
    } catch (error) {
      throw new Error(`Error retrieving evidence: ${error.message}`);
    }
  }

  static async getByConsultationsCode(code) {
    try {
      return await Evidence.findOne({
        where: { Init_Code: code },
      });
    } catch (error) {
      throw new Error(`Error retrieving evidence: ${error.message}`);
    }
  }

  static async getDocumentById(id) {
    try {
      return await Evidence.findOne({
        attributes: ["Evidence_File"],
        where: { Evidence_ID: id },
      });
    } catch (error) {
      throw new Error(`Error retrieving document: ${error.message}`);
    }
  }

  static async create(data, file) {
    const t = await sequelize.transaction();
    try {
      const newEvidence = await Evidence.create(
        {
          Internal_ID: data.Internal_ID,
          Init_Code: data.Init_Code,
          Evidence_Name: data.Evidence_Name || "Sin Documento", // Nombre de la evidencia (ej. "Factura", "Recibo")
          Evidence_Document_Type: file.mimetype || null, // Tipo de documento (ej. application/pdf)
          Evidence_URL: file.path || null, // URL del archivo (si es necesario)
          Evidence_File: file.buffer ? file.buffer : null, // Archivo de evidencia, // Guardar el archivo en formato BLOB
          Evidence_Date: new Date(),
        },
        { transaction: t }
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

      const [rowsUpdated] = await SocialWork.update(data, {
        where: { SW_ProcessNumber: id },
      });

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

  
  static async uploadDocument(id, file, internalId, documentName) {
    try {
        const evidence = await this.getById(id);
        if (!evidence) {
            console.error("No se encontró la evidencia con id:", id);
            return null;
        }

        console.log("Archivo recibido:", file);

        // Verificar tamaño del archivo
        const fileSizeInMB = file.buffer.length / (1024 * 1024);
        if (fileSizeInMB > 5) {
            console.error("El tamaño del archivo excede el límite de 5MB.");
            throw new Error("El archivo supera el límite de los 5MB.");
        }

        // Actualizar la base de datos con el archivo
        await evidence.update({
            Evidence_File: file.buffer,
            Evidence_Name: documentName,
        });

        await AuditModel.registerAudit(
            internalId,
            "UPDATE",
            "Evidence",
            `El usuario interno ${internalId} subió un documento para la evidencia ${id}`
        );

        console.log("Evidencia actualizada con el nuevo documento y auditoría registrada.");

        return evidence;
    } catch (error) {
        console.error("Error en EvidenceModel.uploadDocument:", error.message);
        throw new Error(`Error uploading document: ${error.message}`);
    }
  }

  static async deleteDocument(id, internalId) {
    try {
        const evidence = await this.getById(id);
        if (!evidence) return null;

        // Eliminar el documento de evidencia
        evidence.Evidence_File = null; // O la ruta que corresponda para eliminar el archivo
        evidence.Evidence_Name = null; // Limpiar el nombre del archivo
        await evidence.save();

        await AuditModel.registerAudit(
            internalId, 
            "DELETE",
            "Evidence",
            `El usuario interno ${internalId} eliminó el documento de evidencia ${id}`
        );

        return evidence;
    } catch (error) {
        throw new Error(`Error deleting document: ${error.message}`);
    }
  }
}
