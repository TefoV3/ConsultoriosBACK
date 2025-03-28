import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Documentation_Backup = sequelize.define('Documentation_Backup', {
    Documentation_Backup_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Documentation_Backup_Name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    Documentation_Backup_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
