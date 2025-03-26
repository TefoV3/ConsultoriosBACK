import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const CivilStatus = sequelize.define('CivilStatus', {
    CivilStatus_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    CivilStatus_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    CivilStatus_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
