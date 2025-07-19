import { Evidence } from "../schemas/Evidences.js";
import { InternalUser } from "../schemas/Internal_User.js";
import { InitialConsultations } from "../schemas/Initial_Consultations.js";
import { User } from "../schemas/User.js";
import { AuditModel } from "../models/AuditModel.js";
import { sequelize } from "../database/database.js";
import { getUserId } from '../sessionData.js';
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

  static async create(data, file, internalUser) {
    const t = await sequelize.transaction();
    try {
        const newEvidence = await Evidence.create(
            {
                Internal_ID: data.Internal_ID,
                Init_Code: data.Init_Code,
                Evidence_Name: data.Evidence_Name || "Sin Documento",
                Evidence_Document_Type: file.mimetype || null,
                Evidence_URL: file.path || null,
                Evidence_File: file.buffer ? file.buffer : null,
                Evidence_Date: new Date(),
            },
            { transaction: t }
        );

        const internalId = internalUser || getUserId();
        
        // Get admin user information for audit
        let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
        try {
          const admin = await InternalUser.findOne({
            where: { Internal_ID: internalId },
            attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"],
            transaction: t
          });
          
          if (admin) {
            adminInfo = {
              name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
              role: admin.Internal_Type || 'Rol no especificado',
              role: admin.Internal_Type || 'Rol no especificado', area: admin.Internal_Area || 'Área no especificada'
            };
          }
        } catch (err) {
          console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
        }

        // Get consultation and user information for audit
        let consultationInfo = { subject: 'Materia Desconocida', type: 'Tipo Desconocido' };
        let userFullName = 'Usuario Desconocido';
        if (data.Init_Code) {
          try {
            const consultation = await InitialConsultations.findOne({
              where: { Init_Code: data.Init_Code },
              attributes: ["Init_Subject", "Init_Type", "User_ID"],
              include: [{
                model: User,
                attributes: ["User_FirstName", "User_LastName"]
              }],
              transaction: t
            });
            
            if (consultation) {
              consultationInfo = {
                subject: consultation.Init_Subject || 'Materia Desconocida',
                type: consultation.Init_Type || 'Tipo Desconocido'
              };
              
              if (consultation.User) {
                userFullName = `${consultation.User.User_FirstName} ${consultation.User.User_LastName}`;
              }
            }
          } catch (err) {
            console.warn("No se pudo obtener información de la consulta para auditoría:", err.message);
          }
        }

        const evidenceName = data.Evidence_Name || "Sin Documento";
        const fileType = file.mimetype || 'Sin tipo de archivo';
        const fileSize = file.buffer ? `${(file.buffer.length / 1024).toFixed(2)} KB` : 'Sin archivo';

        await AuditModel.registerAudit(
            internalId,
            "INSERT",
            "Evidence",
            `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) creó evidencia ID ${newEvidence.Evidence_ID} para la consulta ${data.Init_Code} del usuario ${userFullName} - Nombre archivo: "${evidenceName}", Tipo: ${fileType}, Tamaño: ${fileSize}, Materia: ${consultationInfo.subject}, Tipo consulta: ${consultationInfo.type}`,
            { transaction: t }
        );

        await t.commit();
        return newEvidence;
    } catch (error) {
        if (!t.finished) await t.rollback();
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

  static async update(id, data, internalUser) {
    const t = await sequelize.transaction();
    try {
      const record = await Evidence.findOne({ where: { Evidence_ID: id }, transaction: t });
      if (!record) {
        await t.rollback();
        return null;
      }

      // Store original values for audit comparison (all Evidence schema attributes)
      const originalValues = {
        Evidence_Name: record.Evidence_Name,
        Evidence_Document_Type: record.Evidence_Document_Type,
        Evidence_URL: record.Evidence_URL,
        Evidence_Date: record.Evidence_Date
      };

      const internalId = internalUser || getUserId();
      const [rowsUpdated] = await Evidence.update(data, {
        where: { Evidence_ID: id },
        transaction: t
      });

      if (rowsUpdated === 0) {
        await t.rollback();
        return null;
      }

      // Get admin user information for audit
      let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
      try {
        const admin = await InternalUser.findOne({
          where: { Internal_ID: internalId },
          attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"],
          transaction: t
        });
        
        if (admin) {
          adminInfo = {
            name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
            role: admin.Internal_Type || 'Rol no especificado',
            role: admin.Internal_Type || 'Rol no especificado', area: admin.Internal_Area || 'Área no especificada'
          };
        }
      } catch (err) {
        console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
      }

      // Get consultation and user information for audit
      let consultationInfo = { subject: 'Materia Desconocida', type: 'Tipo Desconocido' };
      let userFullName = 'Usuario Desconocido';
      if (record.Init_Code) {
        try {
          const consultation = await InitialConsultations.findOne({
            where: { Init_Code: record.Init_Code },
            attributes: ["Init_Subject", "Init_Type", "User_ID"],
            include: [{
              model: User,
              attributes: ["User_FirstName", "User_LastName"]
            }],
            transaction: t
          });
          
          if (consultation) {
            consultationInfo = {
              subject: consultation.Init_Subject || 'Materia Desconocida',
              type: consultation.Init_Type || 'Tipo Desconocido'
            };
            
            if (consultation.User) {
              userFullName = `${consultation.User.User_FirstName} ${consultation.User.User_LastName}`;
            }
          }
        } catch (err) {
          console.warn("No se pudo obtener información de la consulta para auditoría:", err.message);
        }
      }

      // Build change description for all Evidence attributes - only fields that actually changed
      let changeDetails = [];
      
      if (data.hasOwnProperty('Evidence_Name') && data.Evidence_Name !== originalValues.Evidence_Name) {
        changeDetails.push(`Nombre: "${originalValues.Evidence_Name}" → "${data.Evidence_Name}"`);
      }

      if (data.hasOwnProperty('Evidence_Document_Type') && data.Evidence_Document_Type !== originalValues.Evidence_Document_Type) {
        changeDetails.push(`Tipo documento: "${originalValues.Evidence_Document_Type}" → "${data.Evidence_Document_Type}"`);
      }

      if (data.hasOwnProperty('Evidence_URL') && data.Evidence_URL !== originalValues.Evidence_URL) {
        changeDetails.push(`URL: "${originalValues.Evidence_URL}" → "${data.Evidence_URL}"`);
      }

      if (data.hasOwnProperty('Evidence_Date') && data.Evidence_Date !== originalValues.Evidence_Date) {
        const oldDate = originalValues.Evidence_Date ? new Date(originalValues.Evidence_Date).toISOString().split('T')[0] : 'Sin fecha';
        const newDate = new Date(data.Evidence_Date).toISOString().split('T')[0];
        changeDetails.push(`Fecha: "${oldDate}" → "${newDate}"`);
      }

      const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : '';

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "UPDATE",
        "Evidence",
        `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó la evidencia ID ${id} de la consulta ${record.Init_Code} del usuario ${userFullName} - Materia: ${consultationInfo.subject}, Tipo consulta: ${consultationInfo.type}${changeDescription}`,
        { transaction: t }
      );

      await t.commit();
      return await this.getById(id);
    } catch (error) {
      await t.rollback();
      throw new Error(`Error updating evidence: ${error.message}`);
    }
  }

  static async delete(id, internalUser) {
    try {
      const evidences = await this.getById(id);
      if (!evidences) return null;
      const internalId = internalUser || getUserId();

      // Get admin user information for audit
      let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
      try {
        const admin = await InternalUser.findOne({
          where: { Internal_ID: internalId },
          attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
        });
        
        if (admin) {
          adminInfo = {
            name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
            role: admin.Internal_Type || 'Rol no especificado',
            role: admin.Internal_Type || 'Rol no especificado', area: admin.Internal_Area || 'Área no especificada'
          };
        }
      } catch (err) {
        console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
      }

      // Get consultation information for audit
      let consultationInfo = { subject: 'Materia Desconocida', type: 'Tipo Desconocido' };
      if (evidences.Init_Code) {
        try {
          const consultation = await InitialConsultations.findOne({
            where: { Init_Code: evidences.Init_Code },
            attributes: ["Init_Subject", "Init_Type"]
          });
          
          if (consultation) {
            consultationInfo = {
              subject: consultation.Init_Subject || 'Materia Desconocida',
              type: consultation.Init_Type || 'Tipo Desconocido'
            };
          }
        } catch (err) {
          console.warn("No se pudo obtener información de la consulta para auditoría:", err.message);
        }
      }

      await Evidence.destroy({ where: { Evidence_ID: id } });

      const evidenceName = evidences.Evidence_Name || "Sin nombre";
      const fileType = evidences.Evidence_Document_Type || 'Sin tipo';
      const studentId = evidences.Internal_ID || 'Desconocido';
      const evidenceDate = evidences.Evidence_Date ? new Date(evidences.Evidence_Date).toLocaleDateString('es-ES') : 'Sin fecha';

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "DELETE",
        "Evidence",
        `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó la evidencia ID ${id} de la consulta ${evidences.Init_Code} del estudiante ${studentId} - Nombre: "${evidenceName}", Tipo: ${fileType}, Fecha: ${evidenceDate}, Materia: ${consultationInfo.subject}, Tipo consulta: ${consultationInfo.type}`
      );

      return evidences;
    } catch (error) {
      throw new Error(`Error deleting evidence: ${error.message}`);
    }
  }

  
  static async uploadDocument(id, file, documentName, internalUser) {
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

        const internalId = internalUser || getUserId();

        // Get admin user information for audit
        let adminInfo = { name: 'Usuario Desconocido', area: 'Área no especificada' };
        try {
          const admin = await InternalUser.findOne({
            where: { Internal_ID: internalId },
            attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
          });
          
          if (admin) {
            adminInfo = {
              name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
              role: admin.Internal_Type || 'Rol no especificado', area: admin.Internal_Area || 'Área no especificada'
            };
          }
        } catch (err) {
          console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
        }

        // Get consultation information for audit
        let consultationInfo = { subject: 'Materia Desconocida', type: 'Tipo Desconocido' };
        if (evidence.Init_Code) {
          try {
            const consultation = await InitialConsultations.findOne({
              where: { Init_Code: evidence.Init_Code },
              attributes: ["Init_Subject", "Init_Type"]
            });
            
            if (consultation) {
              consultationInfo = {
                subject: consultation.Init_Subject || 'Materia Desconocida',
                type: consultation.Init_Type || 'Tipo Desconocido'
              };
            }
          } catch (err) {
            console.warn("No se pudo obtener información de la consulta para auditoría:", err.message);
          }
        }

        // Store previous file info for audit
        const previousFileName = evidence.Evidence_Name || 'Sin documento previo';
        const previousFileType = evidence.Evidence_Document_Type || 'Sin tipo previo';

        // Actualizar la base de datos con el archivo
        await evidence.update({
            Evidence_File: file.buffer,
            Evidence_Name: documentName,
            Evidence_Document_Type: file.mimetype,
        });

        const fileSize = `${(file.buffer.length / 1024).toFixed(2)} KB`;
        const studentId = evidence.Internal_ID || 'Desconocido';

        await AuditModel.registerAudit(
            internalId,
            "UPDATE",
            "Evidence",
            `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) subió/actualizó documento para evidencia ID ${id} de la consulta ${evidence.Init_Code} del estudiante ${studentId} - Archivo anterior: "${previousFileName}" (${previousFileType}) → Nuevo archivo: "${documentName}" (${file.mimetype}), Tamaño: ${fileSize}, Materia: ${consultationInfo.subject}, Tipo consulta: ${consultationInfo.type}`
        );

        console.log("Evidencia actualizada con el nuevo documento y auditoría registrada.");

        return evidence;
    } catch (error) {
        console.error("Error en EvidenceModel.uploadDocument:", error.message);
        throw new Error(`Error uploading document: ${error.message}`);
    }
  }

  static async deleteDocument(id, internalUser) {
    try {
        const evidence = await this.getById(id);
        if (!evidence) return null;
        
        const internalId = internalUser || getUserId();

        // Get admin user information for audit
        let adminInfo = { name: 'Usuario Desconocido', area: 'Área no especificada' };
        try {
          const admin = await InternalUser.findOne({
            where: { Internal_ID: internalId },
            attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
          });
          
          if (admin) {
            adminInfo = {
              name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
              role: admin.Internal_Type || 'Rol no especificado', area: admin.Internal_Area || 'Área no especificada'
            };
          }
        } catch (err) {
          console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
        }

        // Get consultation information for audit
        let consultationInfo = { subject: 'Materia Desconocida', type: 'Tipo Desconocido' };
        if (evidence.Init_Code) {
          try {
            const consultation = await InitialConsultations.findOne({
              where: { Init_Code: evidence.Init_Code },
              attributes: ["Init_Subject", "Init_Type"]
            });
            
            if (consultation) {
              consultationInfo = {
                subject: consultation.Init_Subject || 'Materia Desconocida',
                type: consultation.Init_Type || 'Tipo Desconocido'
              };
            }
          } catch (err) {
            console.warn("No se pudo obtener información de la consulta para auditoría:", err.message);
          }
        }

        // Store file info before deletion for audit
        const deletedFileName = evidence.Evidence_Name || 'Sin nombre';
        const deletedFileType = evidence.Evidence_Document_Type || 'Sin tipo';
        const studentId = evidence.Internal_ID || 'Desconocido';

        // Eliminar el documento de evidencia
        evidence.Evidence_File = null;
        evidence.Evidence_Name = "Sin Documento";
        evidence.Evidence_Document_Type = null;
        await evidence.save();

        await AuditModel.registerAudit(
            internalId, 
            "UPDATE",
            "Evidence",
            `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó el documento de la evidencia ID ${id} de la consulta ${evidence.Init_Code} del estudiante ${studentId} - Documento eliminado: "${deletedFileName}" (${deletedFileType}), Materia: ${consultationInfo.subject}, Tipo consulta: ${consultationInfo.type}`
        );

        return evidence;
    } catch (error) {
        throw new Error(`Error deleting document: ${error.message}`);
    }
  }
}
