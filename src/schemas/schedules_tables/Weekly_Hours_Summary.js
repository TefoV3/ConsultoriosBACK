// models/Weekly_Hours_Summary.js
import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

export const Weekly_Hours_Summary = sequelize.define('Weekly_Hours_Summary', {
  WeeklySummary_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Summary_ID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Week_Number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  Week_Start: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Week_End: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Attendance_Hours: {
    type: DataTypes.DECIMAL(5,2),
    defaultValue: 0
  },
  Hours_IsDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});
