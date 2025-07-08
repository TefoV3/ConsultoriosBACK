import { Weekly_Hours_Summary } from "../../schemas/schedules_tables/Weekly_Hours_Summary.js";
import { sequelize } from "../../database/database.js";
import { QueryTypes } from "sequelize";
import { AuditModel } from "../AuditModel.js";
import { getUserId } from "../../sessionData.js";
import { Student_Hours_SummaryModel } from "./Student_Hours_SummaryModel.js";
import { InternalUser } from "../../schemas/Internal_User.js";

// Helper function to get user information for audit
async function getUserInfo(internalId) {
  try {
    const admin = await InternalUser.findOne({
      where: { Internal_ID: internalId },
      attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
    });
    
    if (admin) {
      return `${admin.Internal_Name} ${admin.Internal_LastName} (${admin.Internal_Type || 'Sin rol'} - ${admin.Internal_Area || 'Sin área'})`;
    }
    return `Usuario ID ${internalId} (Información no disponible)`;
  } catch (err) {
    console.warn("No se pudo obtener información del usuario para auditoría:", err.message);
    return `Usuario ID ${internalId} (Error al obtener información)`;
  }
}

export class Weekly_Hours_SummaryModel {
  // 🔹 Get all active weekly summaries
  static async getAll() {
    try {
      return await Weekly_Hours_Summary.findAll({
        where: { Hours_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error fetching weekly summaries: ${error.message}`);
    }
  }

  // 🔹 Get one weekly summary by ID
  static async getById(id) {
    try {
      return await Weekly_Hours_Summary.findOne({
        where: { WeeklySummary_ID: id, Hours_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error fetching weekly summary by ID: ${error.message}`);
    }
  }

  // 🔹 Get weekly summaries by general summary ID (JOIN with Weekly_Tracking and Period)
  static async getByGeneralSummaryId(generalSummaryId) {
    try {
      const query = `
        SELECT 
          whs.WeeklySummary_ID,
          whs.Summary_ID,
          whs.Week_Number,
          whs.Week_Start,
          whs.Week_End,
          whs.Attendance_Hours,
          p.Period_Name
        FROM Weekly_Hours_Summaries whs
        JOIN Weekly_Tracking wt 
          ON whs.Week_Number = wt.Week_Number
          AND whs.Week_Start = wt.Week_Start
          AND whs.Week_End = wt.Week_End
        JOIN Periods p ON p.Period_ID = wt.Period_ID
        WHERE whs.Summary_ID = :generalSummaryId
          AND whs.Hours_IsDeleted = false
          AND wt.Week_IsDeleted = false
          AND p.Period_IsDeleted = false
        ORDER BY whs.Week_Start ASC;
      `;

      return await sequelize.query(query, {
        replacements: { generalSummaryId },
        type: QueryTypes.SELECT
      });
    } catch (error) {
      console.error("Error in getByGeneralSummaryId:", error);
      throw new Error(`Error fetching weekly summaries: ${error.message}`);
    }
  }

  // 🔹 Create a new weekly summary
  static async create(data, options = {}) {
    const t = options.transaction || await sequelize.transaction();
    const shouldCommit = !options.transaction; // Solo hacer commit si nosotros creamos la transacción
    
    try {
      const internalUser = options.internalUser || getUserId();
      const isAutomatic = options.isAutomatic || false; // Flag para indicar si es creación automática
      
      const newRecord = await Weekly_Hours_Summary.create(data, { transaction: t });

      // Solo auditar si se requiere (no siempre para creaciones automáticas)
      if (!options.skipAudit) {
        // Get student information from the general summary
        let studentInfo = { name: 'Usuario Desconocido', area: 'Área no especificada', studentId: 'Desconocido' };
        
        if (data.Summary_ID) {
          try {
            const generalSummary = await Student_Hours_SummaryModel.getById(data.Summary_ID);
            if (generalSummary && generalSummary.Internal_ID) {
              const student = await InternalUser.findOne({
                where: { Internal_ID: generalSummary.Internal_ID },
                attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Area"]
              });
              
              if (student) {
                studentInfo = {
                  name: `${student.Internal_Name} ${student.Internal_LastName}`,
                  area: student.Internal_Area || 'Área no especificada',
                  studentId: student.Internal_ID
                };
              }
            }
          } catch (err) {
            console.warn("No se pudo obtener información del estudiante para auditoría:", err.message);
          }
        }

        const weekStart = data.Week_Start ? new Date(data.Week_Start).toLocaleDateString('es-ES') : 'Sin fecha';
        const weekEnd = data.Week_End ? new Date(data.Week_End).toLocaleDateString('es-ES') : 'Sin fecha';
        const weekNumber = data.Week_Number || 'No especificado';
        const attendanceHours = data.Attendance_Hours || 0;

        const creationType = isAutomatic ? 'automáticamente' : 'manualmente';
        
        // Get user information for audit
        const userInfo = await getUserInfo(internalUser);
        
        // Register detailed audit
        await AuditModel.registerAudit(
          internalUser,
          "INSERT",
          "Weekly_Hours_Summary",
          `${userInfo} creó ${creationType} un resumen semanal de horas ID ${newRecord.WeeklySummary_ID} para el estudiante ${studentInfo.name} (Cédula: ${studentInfo.studentId}, Área: ${studentInfo.area}) - Semana ${weekNumber}: ${weekStart} - ${weekEnd}, Horas de asistencia: ${attendanceHours}`
        );
      }

      if (shouldCommit) await t.commit();
      return newRecord;
    } catch (error) {
      if (shouldCommit) await t.rollback();
      console.error("Error en Weekly_Hours_SummaryModel.create:", error);
      throw new Error(`Error creating weekly summary: ${error.message}`);
    }
  }

  // 🔹 Update a weekly summary by WeeklySummary_ID
  static async update(id, data, options = {}) {
    const t = options.transaction || await sequelize.transaction();
    const shouldCommit = !options.transaction;
    
    try {
      const internalUser = options.internalUser || getUserId();
      const isAutomatic = options.isAutomatic || false;
      
      // Get the existing record for audit purposes
      const existingRecord = await this.getById(id);
      if (!existingRecord) return null;

      const [rowsUpdated] = await Weekly_Hours_Summary.update(data, {
        where: { WeeklySummary_ID: id, Hours_IsDeleted: false },
        transaction: t
      });
      
      if (rowsUpdated === 0) {
        if (shouldCommit) await t.rollback();
        return null;
      }

      // Solo auditar si se requiere
      if (!options.skipAudit) {
        // Get student information from the general summary
        let studentInfo = { name: 'Usuario Desconocido', area: 'Área no especificada', studentId: 'Desconocido' };
        
        if (existingRecord.Summary_ID) {
          try {
            const generalSummary = await Student_Hours_SummaryModel.getById(existingRecord.Summary_ID);
            if (generalSummary && generalSummary.Internal_ID) {
              const student = await InternalUser.findOne({
                where: { Internal_ID: generalSummary.Internal_ID },
                attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Area"]
              });
              
              if (student) {
                studentInfo = {
                  name: `${student.Internal_Name} ${student.Internal_LastName}`,
                  area: student.Internal_Area || 'Área no especificada',
                  studentId: student.Internal_ID
                };
              }
            }
          } catch (err) {
            console.warn("No se pudo obtener información del estudiante para auditoría:", err.message);
          }
        }

        const weekStart = existingRecord.Week_Start ? new Date(existingRecord.Week_Start).toLocaleDateString('es-ES') : 'Sin fecha';
        const weekEnd = existingRecord.Week_End ? new Date(existingRecord.Week_End).toLocaleDateString('es-ES') : 'Sin fecha';
        const weekNumber = existingRecord.Week_Number || 'No especificado';
        
        // Build detailed change description
        let changeDetails = [];
        
        // Compare all possible fields
        if (data.Summary_ID !== undefined && data.Summary_ID !== existingRecord.Summary_ID) {
          changeDetails.push(`ID Resumen General: ${existingRecord.Summary_ID} → ${data.Summary_ID}`);
        }
        if (data.Week_Number !== undefined && data.Week_Number !== existingRecord.Week_Number) {
          changeDetails.push(`Número de semana: ${existingRecord.Week_Number} → ${data.Week_Number}`);
        }
        if (data.Week_Start !== undefined && data.Week_Start !== existingRecord.Week_Start) {
          const oldStart = existingRecord.Week_Start ? new Date(existingRecord.Week_Start).toLocaleDateString('es-ES') : 'Sin fecha';
          const newStart = data.Week_Start ? new Date(data.Week_Start).toLocaleDateString('es-ES') : 'Sin fecha';
          changeDetails.push(`Inicio de semana: ${oldStart} → ${newStart}`);
        }
        if (data.Week_End !== undefined && data.Week_End !== existingRecord.Week_End) {
          const oldEnd = existingRecord.Week_End ? new Date(existingRecord.Week_End).toLocaleDateString('es-ES') : 'Sin fecha';
          const newEnd = data.Week_End ? new Date(data.Week_End).toLocaleDateString('es-ES') : 'Sin fecha';
          changeDetails.push(`Fin de semana: ${oldEnd} → ${newEnd}`);
        }
        if (data.Attendance_Hours !== undefined && data.Attendance_Hours !== existingRecord.Attendance_Hours) {
          const oldHours = existingRecord.Attendance_Hours || 0;
          const newHours = data.Attendance_Hours || 0;
          changeDetails.push(`Horas de asistencia: ${oldHours} → ${newHours}`);
        }

        const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : ' - Sin cambios detectados';
        const updateType = isAutomatic ? 'automáticamente' : 'manualmente';

        // Get user information for audit
        const userInfo = await getUserInfo(internalUser);

        // Register detailed audit
        await AuditModel.registerAudit(
          internalUser,
          "UPDATE",
          "Weekly_Hours_Summary",
          `${userInfo} modificó ${updateType} el resumen semanal de horas ID ${id} del estudiante ${studentInfo.name} (Cédula: ${studentInfo.studentId}, Área: ${studentInfo.area}) - Semana ${weekNumber}: ${weekStart} - ${weekEnd}${changeDescription}`
        );
      }

      if (shouldCommit) await t.commit();
      return await this.getById(id);
    } catch (error) {
      if (shouldCommit) await t.rollback();
      console.error("Error en Weekly_Hours_SummaryModel.update:", error);
      throw new Error(`Error updating weekly summary: ${error.message}`);
    }
  }

  // 🔹 Logical delete
  static async delete(id, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();
      
      // Get the existing record for audit purposes
      const existingRecord = await this.getById(id);
      if (!existingRecord) return false;

      const [rowsUpdated] = await Weekly_Hours_Summary.update(
        { Hours_IsDeleted: true },
        { 
          where: { WeeklySummary_ID: id, Hours_IsDeleted: false },
          transaction: t
        }
      );

      if (rowsUpdated === 0) {
        await t.rollback();
        return false;
      }

      // Get student information from the general summary
      let studentInfo = { name: 'Usuario Desconocido', area: 'Área no especificada', studentId: 'Desconocido' };
      
      if (existingRecord.Summary_ID) {
        try {
          const generalSummary = await Student_Hours_SummaryModel.getById(existingRecord.Summary_ID);
          if (generalSummary && generalSummary.Internal_ID) {
            const student = await InternalUser.findOne({
              where: { Internal_ID: generalSummary.Internal_ID },
              attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Area"]
            });
            
            if (student) {
              studentInfo = {
                name: `${student.Internal_Name} ${student.Internal_LastName}`,
                area: student.Internal_Area || 'Área no especificada',
                studentId: student.Internal_ID
              };
            }
          }
        } catch (err) {
          console.warn("No se pudo obtener información del estudiante para auditoría:", err.message);
        }
      }

      const weekStart = existingRecord.Week_Start ? new Date(existingRecord.Week_Start).toLocaleDateString('es-ES') : 'Sin fecha';
      const weekEnd = existingRecord.Week_End ? new Date(existingRecord.Week_End).toLocaleDateString('es-ES') : 'Sin fecha';
      const weekNumber = existingRecord.Week_Number || 'No especificado';
      const attendanceHours = existingRecord.Attendance_Hours || 0;

      // Get user information for audit
      const userInfo = await getUserInfo(internalId);

      // Register detailed audit
      await AuditModel.registerAudit(
        internalId,
        "DELETE",
        "Weekly_Hours_Summary",
        `${userInfo} eliminó el resumen semanal de horas ID ${id} del estudiante ${studentInfo.name} (Cédula: ${studentInfo.studentId}, Área: ${studentInfo.area}) - Semana ${weekNumber}: ${weekStart} - ${weekEnd}, Horas de asistencia: ${attendanceHours}`
      );

      await t.commit();
      return rowsUpdated > 0;
    } catch (error) {
      await t.rollback();
      console.error("Error en Weekly_Hours_SummaryModel.delete:", error);
      throw new Error(`Error deleting weekly summary: ${error.message}`);
    }
  }
}