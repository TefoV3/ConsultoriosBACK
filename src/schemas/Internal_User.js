import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import bcrypt from "bcrypt";
import { AuditModel } from "../models/AuditModel.js"; // Asegúrate que la ruta sea correcta

/*
CREATE TABLE Internal_User (
    Internal_ID CHAR(10) PRIMARY KEY,
    Internal_FullName CHAR(75),
    Internal_Email CHAR(50),
    Internal_Type CHAR(50), -- e.g., "Coordinator", "Student", etc.
    Internal_Area CHAR(50), -- The area they work in (Civil, Criminal, etc.)
    Internal_Phone CHAR(10),
    Internal_Password CHAR(50)
);
*/

export const InternalUser = sequelize.define('Internal_User', {
    Internal_ID: {
        type: DataTypes.CHAR(15), //Cedula de identidad o Pasaporte
        primaryKey: true
    },
    Internal_Name: DataTypes.STRING(50),
    Internal_LastName: DataTypes.STRING(50),
    Internal_Email: {
        type: DataTypes.STRING(50),
        unique: true
    },
    Internal_Password: DataTypes.STRING(256),
    Internal_Type: DataTypes.STRING(50), // Example: "Coordinator", "Student", etc.
    Internal_Area: DataTypes.STRING(50), // The area of work (e.g., Civil, Criminal, etc.)
    Internal_Phone: DataTypes.STRING(10),
    Internal_Huella:{
        type: DataTypes.BLOB('long')
    },
    Internal_Picture: {
        type: DataTypes.STRING(255), 
        allowNull: true 
    },
    Internal_Status: DataTypes.STRING(50), // Example: "Active", "Inactive", etc.
}, { timestamps: false });


// 🔹 Crear usuario admin por defecto si no existe
async function createDefaultAdmin() {
    try {
        const adminExists = await InternalUser.findOne({
            where: { Internal_ID: "0000000000" }
        });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash("admin123", 10);

            const adminUser = await InternalUser.create({
                Internal_ID: "0000000000",
                Internal_Name: "Admin",
                Internal_LastName: "PUCE",
                Internal_Email: "admin@puce.edu.ec",
                Internal_Password: hashedPassword,
                Internal_Type: "Administrador",
                Internal_Area: "Administración",
                Internal_Phone: "0999999999",
                Internal_Status: "Activo",
                Internal_Huella: null,
                Internal_Picture: null
            });

            console.log("✅ Usuario administrador creado por defecto.");

            // 🔹 Registrar auditoría
            await AuditModel.registerAudit(
                "0000000000",
                "INSERT",
                "Internal_User",
                `Se creó el usuario administrador con ID 0000000000 automáticamente al sincronizar la base de datos.`
            );
        } else {
            console.log("ℹ️ Usuario administrador ya existe.");
        }
    } catch (error) {
        console.error("❌ Error al crear el usuario administrador:", error.message);
    }
}
