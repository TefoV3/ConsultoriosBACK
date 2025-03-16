import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Case } from "./Caso.js";
import { InternalUser } from "./Usuario_interno.js";

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
    Case_Code: {
        type: DataTypes.CHAR(50),
        allowNull: false
    },
    Internal_User_ID: {
        type: DataTypes.CHAR(10),
        allowNull: false
    },
    Last_Activity: DataTypes.STRING(250),
    Activity_Date: DataTypes.DATE,
    Activity_Type: DataTypes.STRING(100),
    Location: DataTypes.STRING(250),
    Time: DataTypes.TIME,
    Duration: DataTypes.TIME,
    Counterparty: DataTypes.STRING(50),
    Judge_Name: DataTypes.STRING(50),
    Reference_File: DataTypes.STRING(25),
    Status: DataTypes.STRING(50),
    Documents: DataTypes.STRING(250)
}, { timestamps: false });

// Define associations
Activity.belongsTo(Case, { foreignKey: "Case_Code" });
Case.hasMany(Activity, { foreignKey: "Case_Code" });

Activity.belongsTo(InternalUser, { foreignKey: "Internal_User_ID" });
InternalUser.hasMany(Activity, { foreignKey: "Internal_User_ID" });
