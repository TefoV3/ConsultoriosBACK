import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Attendance_Record = sequelize.define('Attendance_Record', {
    Attendance_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    UserXPeriod_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Attendance_Entry: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Attendance_Exit: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Attendance_Type: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Attendance_Late: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    Attendance_Comment: {
        type: DataTypes.STRING(300),
        allowNull: true
    },
    Attendance_Date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Attendance_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});
