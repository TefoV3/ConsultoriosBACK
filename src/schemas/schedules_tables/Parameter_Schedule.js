import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Parameter_Schedule = sequelize.define('Parameter_Schedule', {
    Parameter_Schedule_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Parameter_Schedule_Start_Time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    Parameter_Schedule_End_Time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    Parameter_Schedule_Type: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    Parameter_Schedule_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});
