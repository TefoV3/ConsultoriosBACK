import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { InternalUser } from "./Internal_User.js";

export const Audit = sequelize.define("Audit", {
    Id_Audit: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Internal_ID: {
        type: DataTypes.CHAR(15), //Cedula de identidad o Pasaporte
        primaryKey: true
    },
    Audit_Accion: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    Audit_Tabla: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Audit_Descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    Audit_Fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, { timestamps: false });

Audit.belongsTo(InternalUser, { foreignKey: "Internal_ID" });
InternalUser.hasMany(Audit, { foreignKey: "Internal_ID" });

// // Creacion de trigger
// export async function createAuditTriggers() {
//   try {
//     const tablas = [
//       "Academic_Instructions", "Case_Statuses", "Catastrophic_Illnesses", "Cities", "Civil_Statuses", "Client_Types", "Complexities",
//       "Countries", "Derived_Bies", "Disabilities", "Documentation_Backups", "Ethnicities", "Family_Groups", "Family_Incomes",
//       "Field_Of_Activities", "Health_Insurances", "Income_Levels", "Number_Of_Attempts", "Occupations", "Own_Assets",
//       "Pensioners", "Period_Types", "Practical_Hours", "Profiles", "Protocols", "Provinces", "Schedules", "Sectors",
//       "Sexes", "Subjects", "Topics", "Type_Of_Activities", "Type_Of_Attentions", "Type_Of_Housings", "Vulnerable_Situations", "Zones"
//     ];

//     for (const table of tablas) {
//       // Trigger para INSERT
//       await sequelize.query(`
//         DROP TRIGGER IF EXISTS trg_after_insert_${table};
//         CREATE TRIGGER trg_after_insert_${table}
//         AFTER INSERT ON ${table}
//         FOR EACH ROW
//         INSERT INTO Audit (Internal_ID, Audit_Accion, Audit_Tabla, Audit_Descripcion, Audit_Fecha)
//         VALUES (NEW.Internal_ID, 'INSERT', '${table}', CONCAT('Inserción en tabla ${table} con ID: ', NEW.id), NOW());
//       `);

//       // Trigger para UPDATE
//       await sequelize.query(`
//         DROP TRIGGER IF EXISTS trg_after_update_${table};
//         CREATE TRIGGER trg_after_update_${table}
//         AFTER UPDATE ON ${table}
//         FOR EACH ROW
//         INSERT INTO Audit (Internal_ID, Audit_Accion, Audit_Tabla, Audit_Descripcion, Audit_Fecha)
//         VALUES (NEW.Internal_ID, 'UPDATE', '${table}', CONCAT('Actualización en tabla ${table} con ID: ', NEW.id), NOW());
//       `);

//       // Trigger para DELETE
//       await sequelize.query(`
//         DROP TRIGGER IF EXISTS trg_after_delete_${table};
//         CREATE TRIGGER trg_after_delete_${table}
//         AFTER DELETE ON ${table}
//         FOR EACH ROW
//         INSERT INTO Audit (Internal_ID, Audit_Accion, Audit_Tabla, Audit_Descripcion, Audit_Fecha)
//         VALUES (OLD.Internal_ID, 'DELETE', '${table}', CONCAT('Eliminación en tabla ${table} con ID: ', OLD.id), NOW());
//       `);
//     }

//     console.log("✅ Triggers de auditoría creados exitosamente.");
//   } catch (error) {
//     console.error("❌ Error al crear triggers de auditoría:", error.message);
//   }
// }

// // 🔹 Llamar después de definir el modelo
// sequelize.sync().then(() => {
//     createAuditTriggers();
// });