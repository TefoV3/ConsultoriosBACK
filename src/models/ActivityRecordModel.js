import { AuditModel } from "../models/AuditModel.js";
import { Activity } from "../schemas/Activity.js";
import { ActivityRecord } from "../schemas/Activity_Record.js";
import { sequelize } from "../database/database.js";
import { getUserId } from "../sessionData.js";
import { InternalUser } from "../schemas/Internal_User.js";

export class ActivityRecordModel {
  static async getAll() {
    try {
      return await ActivityRecord.findAll();
    } catch (error) {
      throw new Error(`Error retrieving activity records: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      return await ActivityRecord.findOne({
        where: { Record_ID: id },
      });
    } catch (error) {
      throw new Error(`Error retrieving activity record: ${error.message}`);
    }
  }

  static async getAllByActivityId(activityId) {
    try {
      return await ActivityRecord.findAll({
        where: { Activity_ID: activityId },
      });
    } catch (error) {
      throw new Error(`Error retrieving activity records: ${error.message}`);
    }
  }

  static async create(data, internalUser) {
    const t = await sequelize.transaction();
    try {
      const internalId = internalUser || getUserId();

      console.log(
        "📥 Creando registro de actividad para Activity_ID:",
        data.Activity_ID
      );
      
      // 🔍 LOG COMPLETO DE DATOS RECIBIDOS
      console.log("🔍 TODOS LOS DATOS RECIBIDOS:", JSON.stringify(data, null, 2));

      // Crear registro de actividad
      // Calcular si está "on time" (menos de 30 minutos de diferencia)
      let onTime = false;
      if (data.Activity_Record_Recorded_Time && data.Activity_Record_On_Time) {
        const recordedTime = new Date(data.Activity_Record_Recorded_Time);
        const onTimeLimit = new Date(data.Activity_Record_On_Time);
        const diffMinutes = Math.abs(
          (recordedTime - onTimeLimit) / (1000 * 60)
        );
        onTime = diffMinutes <= 30;
      }

      const newRecord = await ActivityRecord.create(
        {
          Activity_ID: data.Activity_ID,
          Activity_Record_Type: data.Activity_Record_Type,
          Activity_Record_Recorded_Time: data.Activity_Record_Recorded_Time,
          Activity_Record_Latitude: data.Activity_Record_Latitude,
          Activity_Record_Longitude: data.Activity_Record_Longitude,
          Activity_Record_On_Time: data.Activity_Record_On_Time,
          Activity_Record_Observation: data.Activity_Record_Observation,
          Activity_Record_Is_On_Time: onTime, // Nuevo campo para indicar si está a tiempo
        },
        { transaction: t }
      );

      console.log("✅ Registro creado con ID:", newRecord.Record_ID);

      // 🔥 Actualizar estado de la actividad cuando es salida
      if (data.Activity_Record_Type === "salida") {
        console.log("📝 Datos recibidos para actualizar Activity:");
        console.log("   - Activity_Status:", data.Activity_Status);
        console.log("   - Activity_Record_Observation:", data.Activity_Record_Observation);
        
        // 🔥 Usar el estado que viene del frontend, o "Completado" por defecto
        const activityStatus = data.Activity_Status || "Completado";

        // 🔥 Preparar los campos a actualizar
        const updateFields = { Activity_Status: activityStatus };

        // 🔥 Si viene observación del registro, actualizar la observación de la actividad
        if (
          data.Activity_Record_Observation !== undefined &&
          data.Activity_Record_Observation !== null &&
          data.Activity_Record_Observation !== ""
        ) {
          updateFields.Activity_Observation = data.Activity_Record_Observation;
          console.log("   ✓ Observación será actualizada con:", data.Activity_Record_Observation);
        } else {
          console.log("   ✗ Observación NO será actualizada (vacía o no enviada)");
        }

        console.log("📤 Campos a actualizar:", updateFields);

        await Activity.update(
          updateFields, // 🔥 Actualiza estado y observación (si viene)
          { where: { Activity_ID: data.Activity_ID }, transaction: t }
        );

        console.log(
          `🔄 Estado de actividad actualizado a '${activityStatus}'${
            updateFields.Activity_Observation ? " con observación" : ""
          }`
        );
      }

      let adminInfo = {
        name: "Usuario Desconocido",
        role: "Rol no especificado",
        area: "Área no especificada",
      };
      try {
        const admin = await InternalUser.findOne({
          where: { Internal_ID: internalId },
          attributes: [
            "Internal_Name",
            "Internal_LastName",
            "Internal_Type",
            "Internal_Area",
          ],
          transaction: t,
        });
        if (admin) {
          adminInfo = {
            name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
            role: admin.Internal_Type || "Rol no especificado",
            area: admin.Internal_Area || "Área no especificada",
          };
        }
      } catch (err) {
        console.warn(
          "No se pudo obtener información del administrador para auditoría:",
          err.message
        );
      }

      // Auditar creación detallada
      await AuditModel.registerAudit(
        internalId,
        "INSERT",
        "Activity_Record",
        `${adminInfo.name} (${adminInfo.role} - ${
          adminInfo.area
        }) creó el registro de actividad ${
          newRecord.Record_ID
        } para la actividad ${data.Activity_ID} (Tipo: ${
          data.Activity_Record_Type
        }, Estado: ${data.Activity_Status || "N/A"}, Observación: ${
          data.Activity_Record_Observation || "N/A"
        })`,
        { transaction: t }
      );

      await t.commit();
      return newRecord; // 👈 Devuelve el objeto Sequelize directo
    } catch (error) {
      await t.rollback();
      console.error("❌ Error en creación y actualización:", error.message);
      throw new Error(`Error creando registro de actividad: ${error.message}`);
    }
  }

  static async update(id, data, internalUser) {
    const t = await sequelize.transaction();
    try {
      console.log("📥 Updating activity record with ID:", id);
      const internalId = internalUser || getUserId();

      const record = await this.getById(id);
      if (!record) {
        await t.rollback();
        return null;
      }

      const [rowsUpdated] = await ActivityRecord.update(data, {
        where: { Record_ID: id },
        transaction: t,
      });

      if (rowsUpdated === 0) {
        await t.rollback();
        return null;
      }

      const updatedRecord = await this.getById(id);
      let adminInfo = {
        name: "Usuario Desconocido",
        role: "Rol no especificado",
        area: "Área no especificada",
      };
      try {
        const admin = await InternalUser.findOne({
          where: { Internal_ID: internalId },
          attributes: [
            "Internal_Name",
            "Internal_LastName",
            "Internal_Type",
            "Internal_Area",
          ],
          transaction: t,
        });
        if (admin) {
          adminInfo = {
            name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
            role: admin.Internal_Type || "Rol no especificado",
            area: admin.Internal_Area || "Área no especificada",
          };
        }
      } catch (err) {
        console.warn(
          "No se pudo obtener información del administrador para auditoría:",
          err.message
        );
      }

      // Describir cambios relevantes
      let changeDetails = [];
      for (const key in data) {
        if (data.hasOwnProperty(key) && data[key] !== originalValues[key]) {
          changeDetails.push(
            `${key}: "${originalValues[key] ?? ""}" → "${data[key] ?? ""}"`
          );
        }
      }
      const changeDescription =
        changeDetails.length > 0
          ? ` - Cambios: ${changeDetails.join(", ")}`
          : "";

      await AuditModel.registerAudit(
        internalId,
        "UPDATE",
        "Activity_Record",
        `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó el registro de actividad ${id}${changeDescription}`,
        { transaction: t }
      );

      await t.commit();
      return updatedRecord;
    } catch (error) {
      await t.rollback();
      throw new Error(`Error updating activity record: ${error.message}`);
    }
  }

  static async delete(id, internalUser) {
    const t = await sequelize.transaction();
    try {
      const record = await this.getById(id);
      if (!record) {
        await t.rollback();
        return null;
      }

      const internalId = internalUser || getUserId();

      await ActivityRecord.destroy({
        where: { Record_ID: id },
        transaction: t,
      });

      // Obtener información del usuario interno para auditoría
      let adminInfo = {
        name: "Usuario Desconocido",
        role: "Rol no especificado",
        area: "Área no especificada",
      };
      try {
        const admin = await InternalUser.findOne({
          where: { Internal_ID: internalId },
          attributes: [
            "Internal_Name",
            "Internal_LastName",
            "Internal_Type",
            "Internal_Area",
          ],
          transaction: t,
        });
        if (admin) {
          adminInfo = {
            name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
            role: admin.Internal_Type || "Rol no especificado",
            area: admin.Internal_Area || "Área no especificada",
          };
        }
      } catch (err) {
        console.warn(
          "No se pudo obtener información del administrador para auditoría:",
          err.message
        );
      }

      await AuditModel.registerAudit(
        internalId,
        "DELETE",
        "Activity_Record",
        `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) eliminó el registro de actividad ${id} (Actividad asociada: ${record.Activity_ID})`,
        { transaction: t }
      );

      await t.commit();
      return record;
    } catch (error) {
      await t.rollback();
      throw new Error(`Error deleting activity record: ${error.message}`);
    }
  }
}
