import { DataTypes } from 'sequelize';
import { sequelize } from "../../database/database.js";

export const Student_Hours_Summary = sequelize.define('Student_Hours_Summary', {
    Summary_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Internal_ID: { 
        type: DataTypes.CHAR(15),
        allowNull: false
    },
    Summary_Start: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Summary_End: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Summary_Extra_Hours: {
        type: DataTypes.DECIMAL(5,2),
        defaultValue: 0
    },
    Summary_Reduced_Hours: {
        type: DataTypes.DECIMAL(5,2),
        defaultValue: 0
    },
    Summary_IsComplete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    Summary_Total_Hours: {
        type: DataTypes.DECIMAL(5,2),
        defaultValue: 0
    },
    Hours_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    } 
});
