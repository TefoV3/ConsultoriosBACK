import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { InternalUser } from "./Internal_User.js";
import { InitialConsultations } from "./Initial_Consultations.js";

/*
CREATE TABLE Activity (
    Activity_ID INT PRIMARY KEY AUTO_INCREMENT,
    Case_Code CHAR(50) NOT NULL,
    Internal_User_ID CHAR(10) NOT NULL,
    Last_Activity CHAR(250),
    Activity_Date DATE,
    Activity_Type CHAR(100),
    Location CHAR(250),
    Time TIME,
    Duration TIME,
    Counterparty CHAR(50),
    Judge_Name CHAR(50),
    Reference_File CHAR(25),
    Status CHAR(50),
    Documents CHAR(250)
);
*/

export const Activity = sequelize.define('Activity', {
    Activity_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Init_Code: {
        type: DataTypes.CHAR(50),
        primaryKey: true
    },
    Internal_ID: {
        type: DataTypes.CHAR(15),
        allowNull: false
    },
    Last_Activity: DataTypes.STRING(250),
    Activity_Date: DataTypes.DATE,
    Activity_Type: DataTypes.STRING(100),
    Location: DataTypes.STRING(250),
    Time: DataTypes.TIME,
    Duration: DataTypes.TIME,
    Counterparty: DataTypes.STRING(50),
    Judged: DataTypes.STRING(50),
    Judge_Name: DataTypes.STRING(50),
    Reference_File: DataTypes.STRING(25),
    Status: DataTypes.STRING(50),
    Documents: {
        type: DataTypes.BLOB("long"),
        allowNull: true
    }
}, { timestamps: false });

// Define associations
Activity.belongsTo(InitialConsultations, { foreignKey: "Init_Code" });
InitialConsultations.hasMany(Activity, { foreignKey: "Init_Code" });

Activity.belongsTo(InternalUser, { foreignKey: "Internal_ID" });
InternalUser.hasMany(Activity, { foreignKey: "Internal_ID" });
