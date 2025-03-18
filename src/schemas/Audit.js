import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

export const Audit = sequelize.define("Audit", {
    Id_Audit: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    User_ID: {
        type: DataTypes.STRING(10),
        allowNull: false
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
