import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Schedule = sequelize.define('Schedule', {
    Schedule_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Schedule_Limit: DataTypes.TIME,
    Schedule_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});