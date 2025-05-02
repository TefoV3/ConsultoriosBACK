import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Period = sequelize.define('Period', {
    Period_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Period_Name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Period_Type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Period_Start: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Period_End: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Period_Total_Hours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    Period_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});
