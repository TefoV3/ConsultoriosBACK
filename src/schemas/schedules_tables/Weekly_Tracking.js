import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Weekly_Tracking = sequelize.define('Weekly_Tracking', {
    Week_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    Period_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Week_Number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Week_Start: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Week_End: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Week_Hours: {
        type: DataTypes.DECIMAL(8,2),
        allowNull: false,
        defaultValue: 0
    },
    Week_Holiday: {
        type: DataTypes.DECIMAL(8,2),
        allowNull: false,
        defaultValue: 0
    },
    Week_Comment: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    Week_IsDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'Weekly_Tracking'
});
