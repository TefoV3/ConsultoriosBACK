import { UserXPeriod } from "../../schemas/schedules_tables/UserXPeriod.js";
import { InternalUser } from "../../schemas/Internal_User.js";
import { Period } from "../../schemas/schedules_tables/Period.js";
import { AuditModel } from "../AuditModel.js";
import { sequelize } from "../../database/database.js";
import { getUserId } from "../../sessionData.js";

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

export class UserXPeriodModel {
  static async getAll() {
    try {
      return await UserXPeriod.findAll({
        where: { UserXPeriod_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error fetching UserXPeriod: ${error.message}`);
    }
  }

  static async getById(periodId, internalId) {
    try {
      return await UserXPeriod.findOne({
        where: { Period_ID: periodId, Internal_ID: internalId, UserXPeriod_IsDeleted: false }
      });
    } catch (error) {
      throw new Error(`Error fetching UserXPeriod: ${error.message}`);
    }
  }

  static async getAllWithUsersAndPeriods() {
    try {
      return await UserXPeriod.findAll({
        where: { UserXPeriod_IsDeleted: false },
        include: [
          {
            model: InternalUser,
            as: "user",
            attributes: [
              "Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email",
              "Internal_Phone", "Internal_Area", "Internal_Status", "Internal_Type", "Internal_Huella"
            ],
            where: { Internal_Status: "Activo" }
          },
          {
            model: Period,
            as: "period",
            attributes: ["Period_ID", "Period_Name"],
            where: { Period_IsDeleted: false }
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error fetching users with periods: ${error.message}`);
    }
  }

  static async getByInternalId(internalId) {
    try {
      return await UserXPeriod.findAll({
        where: { Internal_ID: internalId, UserXPeriod_IsDeleted: false },
        include: [
          {
            model: InternalUser,
            as: "user",
            attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"],
            where: { Internal_Status: "Activo" }
          },
          {
            model: Period,
            as: "period",
            attributes: ["Period_ID", "Period_Name", "Period_Start", "Period_End"],
            where: { Period_IsDeleted: false }
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error fetching user with periods: ${error.message}`);
    }
  }

  static async getByPeriod(periodId) {
    try {
      return await UserXPeriod.findAll({
        where: { Period_ID: periodId, UserXPeriod_IsDeleted: false },
        include: [
          {
            model: InternalUser,
            as: "user",
            attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"],
            where: { Internal_Status: "Activo" }
          },
          {
            model: Period,
            as: "period",
            attributes: ["Period_ID", "Period_Name"]
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error fetching users by period: ${error.message}`);
    }
  }

  static async getByPeriodAndInternalId(periodId, internalId) {
    try {
      return await UserXPeriod.findOne({
        where: { Period_ID: periodId, Internal_ID: internalId }
      });
    } catch (error) {
      throw new Error(`Error fetching UserXPeriod: ${error.message}`);
    }
  }

  static async getByPeriodAndArea(periodId, area) {
    try {
      return await UserXPeriod.findAll({
        where: { Period_ID: periodId, UserXPeriod_IsDeleted: false },
        include: [
          {
            model: InternalUser,
            as: "user",
            attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"],
            where: { Internal_Area: area }
          },
          {
            model: Period,
            as: "period",
            attributes: ["Period_ID", "Period_Name"]
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error fetching users by period and area: ${error.message}`);
    }
  }

  static async getByUserXPeriodId(id) {
    try {
      return await UserXPeriod.findOne({
        where: { UserXPeriod_ID: id, UserXPeriod_IsDeleted: false },
        include: [
          {
            model: InternalUser,
            as: "user",
            attributes: ["Internal_ID", "Internal_Name", "Internal_LastName", "Internal_Email", "Internal_Area"],
            where: { Internal_Status: "Activo" }
          },
          {
            model: Period,
            as: "period",
            attributes: ["Period_ID", "Period_Name"],
            where: { Period_IsDeleted: false }
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error fetching UserXPeriod by ID: ${error.message}`);
    }
  }

  static async create(data, internalUser, options = {}) {
    const t = await sequelize.transaction(); // Start transaction
    try {
      const internalId = internalUser || getUserId();
      const entries = Array.isArray(data) ? data : [data];
      const toCreate = [];
      const reactivated = [];

      for (const entry of entries) {
        const existing = await this.getByPeriodAndInternalId(entry.Period_ID, entry.Internal_ID);
        if (existing) {
          if (existing.UserXPeriod_IsDeleted) {
            await UserXPeriod.update(
              { UserXPeriod_IsDeleted: false },
              { where: { Period_ID: entry.Period_ID, Internal_ID: entry.Internal_ID }, transaction: t }
            );
            const reloaded = await this.getByPeriodAndInternalId(entry.Period_ID, entry.Internal_ID);
            reactivated.push(reloaded);

            // Register audit for reactivation
            // Get admin and student information for audit
            let studentInfo = { name: 'Usuario Desconocido', area: 'Área no especificada' };
            let periodInfo = { name: 'Período Desconocido' };
            
            try {
              const student = await InternalUser.findOne({
                where: { Internal_ID: entry.Internal_ID },
                attributes: ["Internal_Name", "Internal_LastName", "Internal_Area"]
              });
              
              if (student) {
                studentInfo = {
                  name: `${student.Internal_Name} ${student.Internal_LastName}`,
                  area: student.Internal_Area || 'Área no especificada'
                };
              }

              const period = await Period.findOne({
                where: { Period_ID: entry.Period_ID },
                attributes: ["Period_Name"]
              });
              
              if (period) {
                periodInfo.name = period.Period_Name || 'Período Desconocido';
              }
            } catch (err) {
              console.warn("No se pudo obtener información para auditoría:", err.message);
            }

            // Get user information for audit
            const userInfo = await getUserInfo(internalId);

            await AuditModel.registerAudit(
              internalId,
              "UPDATE",
              "UserXPeriod",
              `${userInfo} reactivó a ${studentInfo.name} (Cédula: ${entry.Internal_ID}, Área: ${studentInfo.area}) en el período "${periodInfo.name}"`
            );
          }
        } else {
          toCreate.push(entry);
        }
      }

      const created = toCreate.length > 0 ? await UserXPeriod.bulkCreate(toCreate, { ...options, transaction: t }) : [];

      // Register audit for new creations
      for (const createdEntry of created) {
        // Get student and period information for each creation
        let studentInfo = { name: 'Usuario Desconocido', area: 'Área no especificada' };
        let periodInfo = { name: 'Período Desconocido' };
        
        try {
          const student = await InternalUser.findOne({
            where: { Internal_ID: createdEntry.Internal_ID },
            attributes: ["Internal_Name", "Internal_LastName", "Internal_Area"]
          });
          
          if (student) {
            studentInfo = {
              name: `${student.Internal_Name} ${student.Internal_LastName}`,
              area: student.Internal_Area || 'Área no especificada'
            };
          }

          const period = await Period.findOne({
            where: { Period_ID: createdEntry.Period_ID },
            attributes: ["Period_Name"]
          });
          
          if (period) {
            periodInfo.name = period.Period_Name || 'Período Desconocido';
          }
        } catch (err) {
          console.warn("No se pudo obtener información para auditoría:", err.message);
        }

        // Get user information for audit
        const userInfo = await getUserInfo(internalId);

        await AuditModel.registerAudit(
          internalId,
          "INSERT",
          "UserXPeriod",
          `${userInfo} agregó a ${studentInfo.name} (Cédula: ${createdEntry.Internal_ID}, Área: ${studentInfo.area}) al período "${periodInfo.name}"`
        );
      }

      await t.commit(); // Commit transaction
      return [...reactivated, ...created];
    } catch (error) {
      await t.rollback(); // Rollback on error
      console.error("Error en UserXPeriodModel.create:", error);
      throw new Error(`Error creating UserXPeriod: ${error.message}`);
    }
  }

  static async update(periodId, internalId, data, internalUser) {
    const t = await sequelize.transaction(); // Start transaction
    try {
      const userId = internalUser || getUserId();
      const existing = await this.getById(periodId, internalId);
      if (!existing) {
        await t.rollback();
        return null;
      }

      // Store original values for comparison
      const oldValues = {
        Period_ID: existing.Period_ID,
        Internal_ID: existing.Internal_ID,
        UserXPeriod_Comment: existing.UserXPeriod_Comment,
        UserXPeriod_IsDeleted: existing.UserXPeriod_IsDeleted
      };

      const [updatedRows] = await UserXPeriod.update(data, {
        where: { Period_ID: periodId, Internal_ID: internalId, UserXPeriod_IsDeleted: false },
        transaction: t
      });

      if (updatedRows === 0) {
        await t.rollback();
        return null;
      }

      // Get information for audit
      let studentInfo = { name: 'Usuario Desconocido', area: 'Área no especificada' };
      let periodInfo = { name: 'Período Desconocido' };
      
      try {
        const student = await InternalUser.findOne({
          where: { Internal_ID: internalId },
          attributes: ["Internal_Name", "Internal_LastName", "Internal_Area"]
        });
        
        if (student) {
          studentInfo = {
            name: `${student.Internal_Name} ${student.Internal_LastName}`,
            area: student.Internal_Area || 'Área no especificada'
          };
        }

        const period = await Period.findOne({
          where: { Period_ID: periodId },
          attributes: ["Period_Name"]
        });
        
        if (period) {
          periodInfo.name = period.Period_Name || 'Período Desconocido';
        }
      } catch (err) {
        console.warn("No se pudo obtener información para auditoría:", err.message);
      }

      // Build detailed change description
      let changeDetails = [];
      
      if (data.Period_ID !== undefined && data.Period_ID !== oldValues.Period_ID) {
        try {
          const newPeriod = await Period.findOne({
            where: { Period_ID: data.Period_ID },
            attributes: ["Period_Name"]
          });
          const newPeriodName = newPeriod?.Period_Name || 'Período Desconocido';
          changeDetails.push(`Período: "${periodInfo.name}" → "${newPeriodName}"`);
        } catch (err) {
          changeDetails.push(`Período ID: ${oldValues.Period_ID} → ${data.Period_ID}`);
        }
      }
      
      if (data.Internal_ID !== undefined && data.Internal_ID !== oldValues.Internal_ID) {
        changeDetails.push(`Usuario ID: ${oldValues.Internal_ID} → ${data.Internal_ID}`);
      }
      
      if (data.UserXPeriod_Comment !== undefined && data.UserXPeriod_Comment !== oldValues.UserXPeriod_Comment) {
        const oldComment = oldValues.UserXPeriod_Comment || 'Sin comentario';
        const newComment = data.UserXPeriod_Comment || 'Sin comentario';
        changeDetails.push(`Comentario: "${oldComment}" → "${newComment}"`);
      }

      // Get user information for audit
      const userInfo = await getUserInfo(userId);

      const changeDescription = changeDetails.length > 0 ? ` - Cambios: ${changeDetails.join(', ')}` : ' - Sin cambios detectados';

      // Register detailed audit
      await AuditModel.registerAudit(
        userId,
        "UPDATE",
        "UserXPeriod",
        `${userInfo} modificó la asignación de ${studentInfo.name} (Cédula: ${internalId}, Área: ${studentInfo.area}) en el período "${periodInfo.name}"${changeDescription}`
      );

      await t.commit(); // Commit transaction

      const newPeriodId = data.Period_ID || periodId;
      const newInternalId = data.Internal_ID || internalId;

      return await this.getById(newPeriodId, newInternalId);
    } catch (error) {
      await t.rollback(); // Rollback on error
      console.error("Error en UserXPeriodModel.update:", error);
      throw new Error(`Error updating UserXPeriod: ${error.message}`);
    }
  }

  static async delete(periodId, internalId, internalUser) {
    try {
      if (!periodId || !internalId) {
        throw new Error("The Period_ID and Internal_ID fields are required to delete a UserXPeriod");
      }

      const userId = internalUser || getUserId();
      const existing = await this.getById(periodId, internalId);
      if (!existing) return null;

      await UserXPeriod.update(
        { UserXPeriod_IsDeleted: true },
        { where: { Period_ID: periodId, Internal_ID: internalId, UserXPeriod_IsDeleted: false } }
      );

      // Get information for audit
      let studentInfo = { name: 'Usuario Desconocido', area: 'Área no especificada' };
      let periodInfo = { name: 'Período Desconocido' };
      
      try {
        const student = await InternalUser.findOne({
          where: { Internal_ID: internalId },
          attributes: ["Internal_Name", "Internal_LastName", "Internal_Area"]
        });
        
        if (student) {
          studentInfo = {
            name: `${student.Internal_Name} ${student.Internal_LastName}`,
            area: student.Internal_Area || 'Área no especificada'
          };
        }

        const period = await Period.findOne({
          where: { Period_ID: periodId },
          attributes: ["Period_Name"]
        });
        
        if (period) {
          periodInfo.name = period.Period_Name || 'Período Desconocido';
        }
      } catch (err) {
        console.warn("No se pudo obtener información para auditoría:", err.message);
      }

      // Get user information for audit
      const userInfo = await getUserInfo(userId);

      await AuditModel.registerAudit(
        userId,
        "DELETE",
        "UserXPeriod",
        `${userInfo} eliminó a ${studentInfo.name} (Cédula: ${internalId}, Área: ${studentInfo.area}) del período "${periodInfo.name}"`
      );

      return await UserXPeriod.findOne({ where: { Period_ID: periodId, Internal_ID: internalId } });
    } catch (error) {
      throw new Error(`Error deleting UserXPeriod: ${error.message}`);
    }
  }
}
