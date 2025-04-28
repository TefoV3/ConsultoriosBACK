import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Extra_Hours = sequelize.define('Extra_Hours', {
    Hours_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Internal_ID: { 
        type: DataTypes.CHAR(15),
        allowNull: false
    },
    Hours_Num: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false
    },
    Hours_Approved_By: {
        type: DataTypes.STRING(100)
    },
    Hours_Type: {
        type: DataTypes.STRING(100)
    },
    Hours_Date: {
        type: DataTypes.DATE
    },
    Hours_Comment: {
        type: DataTypes.TEXT
    },
    Hours_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});
