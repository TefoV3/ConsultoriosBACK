import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Alert = sequelize.define('Alert', {
    Alert_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Internal_ID: {
        type: DataTypes.CHAR(15),
        allowNull: false
    },
    Alert_Message: {
        type: DataTypes.STRING(300),
        allowNull: false
    },
    Alert_Type: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    Alert_Approval_Status: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    Alert_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});
