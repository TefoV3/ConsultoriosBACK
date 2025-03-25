import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Sex = sequelize.define('Sex', {
    Sex_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Sex_Name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Sex_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });
