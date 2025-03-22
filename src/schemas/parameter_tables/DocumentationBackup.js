import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const DocumentationBackup = sequelize.define('DocumentationBackup', {
    DocumentationBackup_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    DocumentationBackup_Name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    DocumentationBackup_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});
