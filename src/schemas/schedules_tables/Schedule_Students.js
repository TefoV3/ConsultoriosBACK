import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Schedule_Students = sequelize.define('ScheduleStudents', {
    Schedule_Students_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    UserXPeriod_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Schedule_Day_Monday: {
        type: DataTypes.INTEGER,
    },
    Schedule_Day_Tuesday: {
        type: DataTypes.INTEGER,
    },
    Schedule_Day_Wednesday: {
        type: DataTypes.INTEGER,
    },
    Schedule_Day_Thursday: {
        type: DataTypes.INTEGER,
    },
    Schedule_Day_Friday: {
        type: DataTypes.INTEGER,
    },
    Schedule_Mode: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    Schedule_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});
