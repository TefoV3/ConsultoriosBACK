import { InternalUser } from "../../schemas/Internal_User.js";
import { Student_Hours_Summary } from "../../schemas/schedules_tables/Student_Hours_Summary.js";
import { AuditModel } from "../AuditModel.js";
import { getUserId } from "../../sessionData.js";
import { sequelize } from "../../database/database.js";

export class Student_Hours_SummaryModel {
  static async getAll() {
    try {
      return await Student_Hours_Summary.findAll({
        where: { Hours_IsDeleted: false },
      });
    } catch (error) {
      throw new Error(`Error fetching student summaries: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      return await Student_Hours_Summary.findOne({
        where: { Summary_ID: id, Hours_IsDeleted: false },
      });
    } catch (error) {
      throw new Error(`Error fetching student summary by ID: ${error.message}`);
    }
  }

  static async create(data, options = {}) {
    const t = options.transaction || await sequelize.transaction();
    const shouldCommit = !options.transaction; // Solo hacer commit si nosotros creamos la transacción
    
    try {
      const internalUser = options.internalUser || getUserId();
      const isAutomatic = options.isAutomatic || false; // Flag para indicar si es creación automática
      
      const newRecord = await Student_Hours_Summary.create(data, { ...options, transaction: t });

      // Solo auditar si se requiere (no siempre para creaciones automáticas)
      if (!options.skipAudit) {
        // Get student information
        let studentInfo = { name: 'Usuario Desconocido', area: 'Área no especificada', studentId: data.Internal_ID || 'Desconocido' };
        
        if (data.Internal_ID) {
          try {
            const student = await InternalUser.findOne({
              where: { Internal_ID: data.Internal_ID },
              attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Area"]
            });
            
            if (student) {
              studentInfo = {
                name: `${student.Internal_Name} ${student.Internal_LastName}`,
                area: student.Internal_Area || 'Área no especificada',
                studentId: student.Internal_ID
              };
            }
          } catch (err) {
            console.warn("No se pudo obtener información del estudiante para auditoría:", err.message);
          }
        }

        const summaryStart = data.Summary_Start ? new Date(data.Summary_Start).toLocaleDateString('es-ES') : 'Sin fecha';
        const totalHours = data.Summary_Total_Hours || 0;
        const extraHours = data.Summary_Extra_Hours || 0;
        const reducedHours = data.Summary_Reduced_Hours || 0;
        const isComplete = data.Summary_IsComplete ? 'Sí' : 'No';

        const creationType = isAutomatic ? 'automáticamente' : 'manualmente';
        
        // Register detailed audit
        await AuditModel.registerAudit(
          internalUser,
          "INSERT",
          "Student_Hours_Summary",
          `El usuario interno ${internalUser} creó ${creationType} un resumen de horas ID ${newRecord.Summary_ID} para el estudiante ${studentInfo.name} (Cédula: ${studentInfo.studentId}, Área: ${studentInfo.area}) - Inicio: ${summaryStart}, Horas totales: ${totalHours}, Horas extra: ${extraHours}, Horas reducidas: ${reducedHours}, Completado: ${isComplete}`
        );
      }

      if (shouldCommit) await t.commit();
      return newRecord;
    } catch (error) {
      if (shouldCommit) await t.rollback();
      console.error("Error en Student_Hours_SummaryModel.create:", error);
      throw new Error(`Error creating student summary: ${error.message}`);
    }
  }

  static async update(id, data, options = {}) {
    const t = options.transaction || await sequelize.transaction();
    const shouldCommit = !options.transaction;
    
    try {
      const internalUser = options.internalUser || getUserId();
      const isAutomatic = options.isAutomatic || false;
      
      const exists = await this.getById(id);
      if (!exists) return null;

      const [updated] = await Student_Hours_Summary.update(data, {
        where: { Summary_ID: id, Hours_IsDeleted: false },
        transaction: t,
        ...options,
      });

      if (updated === 0) {
        if (shouldCommit) await t.rollback();
        return null;
      }

      // Solo auditar si se requiere
      if (!options.skipAudit) {
        // Get student information
        let studentInfo = { name: 'Usuario Desconocido', area: 'Área no especificada', studentId: exists.Internal_ID || 'Desconocido' };
        
        if (exists.Internal_ID) {
          try {
            const student = await InternalUser.findOne({
              where: { Internal_ID: exists.Internal_ID },
              attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Area"]
            });
            
            if (student) {
              studentInfo = {
                name: `${student.Internal_Name} ${student.Internal_LastName}`,
                area: student.Internal_Area || 'Área no especificada',
                studentId: student.Internal_ID
              };
            }
          } catch (err) {
            console.warn("No se pudo obtener información del estudiante para auditoría:", err.message);
          }
        }

        // Build change description
        let changeDetails = [];
        
        const oldTotalHours = exists.Summary_Total_Hours || 0;
        const newTotalHours = data.Summary_Total_Hours !== undefined ? data.Summary_Total_Hours : oldTotalHours;
        if (oldTotalHours !== newTotalHours) {
          changeDetails.push(`Horas totales: ${oldTotalHours} → ${newTotalHours}`);
        }

        const oldExtraHours = exists.Summary_Extra_Hours || 0;
        const newExtraHours = data.Summary_Extra_Hours !== undefined ? data.Summary_Extra_Hours : oldExtraHours;
        if (oldExtraHours !== newExtraHours) {
          changeDetails.push(`Horas extra: ${oldExtraHours} → ${newExtraHours}`);
        }

        const oldReducedHours = exists.Summary_Reduced_Hours || 0;
        const newReducedHours = data.Summary_Reduced_Hours !== undefined ? data.Summary_Reduced_Hours : oldReducedHours;
        if (oldReducedHours !== newReducedHours) {
          changeDetails.push(`Horas reducidas: ${oldReducedHours} → ${newReducedHours}`);
        }

        const oldComplete = exists.Summary_IsComplete ? 'Sí' : 'No';
        const newComplete = data.Summary_IsComplete !== undefined ? (data.Summary_IsComplete ? 'Sí' : 'No') : oldComplete;
        if (oldComplete !== newComplete) {
          changeDetails.push(`Completado: ${oldComplete} → ${newComplete}`);
        }

        const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : '';
        const updateType = isAutomatic ? 'automáticamente' : 'manualmente';

        // Register detailed audit
        await AuditModel.registerAudit(
          internalUser,
          "UPDATE",
          "Student_Hours_Summary",
          `El usuario interno ${internalUser} actualizó ${updateType} el resumen de horas ID ${id} del estudiante ${studentInfo.name} (Cédula: ${studentInfo.studentId}, Área: ${studentInfo.area})${changeDescription}`
        );
      }

      if (shouldCommit) await t.commit();
      return await this.getById(id);
    } catch (error) {
      if (shouldCommit) await t.rollback();
      console.error("Error en Student_Hours_SummaryModel.update:", error);
      throw new Error(`Error updating student summary: ${error.message}`);
    }
  }

  static async delete(id, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      const exists = await this.getById(id);
      if (!exists) return null;

      await Student_Hours_Summary.update(
        { Hours_IsDeleted: true },
        { 
          where: { Summary_ID: id, Hours_IsDeleted: false },
          transaction: t
        }
      );

      // Get student information for audit
      let studentInfo = { name: 'Usuario Desconocido', area: 'Área no especificada', studentId: exists.Internal_ID || 'Desconocido' };
      
      if (exists.Internal_ID) {
        try {
          const student = await InternalUser.findOne({
            where: { Internal_ID: exists.Internal_ID },
            attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Area"]
          });
          
          if (student) {
            studentInfo = {
              name: `${student.Internal_Name} ${student.Internal_LastName}`,
              area: student.Internal_Area || 'Área no especificada',
              studentId: student.Internal_ID
            };
          }
        } catch (err) {
          console.warn("No se pudo obtener información del estudiante para auditoría:", err.message);
        }
      }

      const summaryStart = exists.Summary_Start ? new Date(exists.Summary_Start).toLocaleDateString('es-ES') : 'Sin fecha';
      const totalHours = exists.Summary_Total_Hours || 0;
      const extraHours = exists.Summary_Extra_Hours || 0;
      const reducedHours = exists.Summary_Reduced_Hours || 0;
      const isComplete = exists.Summary_IsComplete ? 'Sí' : 'No';

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "DELETE",
        "Student_Hours_Summary",
        `El usuario interno ${internalId} eliminó el resumen de horas ID ${id} del estudiante ${studentInfo.name} (Cédula: ${studentInfo.studentId}, Área: ${studentInfo.area}) - Inicio: ${summaryStart}, Horas totales: ${totalHours}, Horas extra: ${extraHours}, Horas reducidas: ${reducedHours}, Completado: ${isComplete}`
      );

      await t.commit();
      return await Student_Hours_Summary.findOne({ where: { Summary_ID: id } });
    } catch (error) {
      await t.rollback();
      console.error("Error en Student_Hours_SummaryModel.delete:", error);
      throw new Error(`Error deleting student summary: ${error.message}`);
    }
  }

  static async getAllWithStudents() {
    try {
      return await Student_Hours_Summary.findAll({
        where: { Hours_IsDeleted: false },
        include: [
          {
            model: InternalUser,
            as: "userSummary",
            attributes: [
              "Internal_ID",
              "Internal_Name",
              "Internal_LastName",
              "Internal_Area",
              "Internal_Email",
            ],
            where: { Internal_Status: "Activo" },
          },
        ],
      });
    } catch (error) {
      throw new Error(`Error fetching all summaries with students: ${error.message}`);
    }
  }

  static async getByCedula(internalId) {
    try {
      return await Student_Hours_Summary.findOne({
        where: { Hours_IsDeleted: false, Internal_ID: internalId },
        include: [
          {
            model: InternalUser,
            as: "userSummary",
            attributes: [
              "Internal_ID",
              "Internal_Name",
              "Internal_LastName",
              "Internal_Area",
              "Internal_Email",
            ],
            where: { Internal_Status: "Activo" },
          },
        ],
      });
    } catch (error) {
      throw new Error(`Error fetching summary by cedula: ${error.message}`);
    }
  }

  static async getWithUserDetails(id) {
    try {
      return await Student_Hours_Summary.findOne({
        where: { Internal_ID: id, Hours_IsDeleted: false },
        include: [
          {
            model: InternalUser,
            as: "userSummary",
            attributes: [
              "Internal_ID",
              "Internal_Name",
              "Internal_LastName",
              "Internal_Area",
              "Internal_Email",
            ],
            where: { Internal_Status: "Activo" },
          },
        ],
      });
    } catch (error) {
      throw new Error(`Error fetching user summary with details: ${error.message}`);
    }
  }

  static async getByUser(id) {
    try {
      return await Student_Hours_Summary.findOne({
        where: { Internal_ID: id, Hours_IsDeleted: false },
      });
    } catch (error) {
      throw new Error(`Error fetching summary by user: ${error.message}`);
    }
  }
}
