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