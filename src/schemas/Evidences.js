import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Case } from "./Case.js";
import { Activity } from "./Activity.js";
import { InitialConsultations } from "./Initial_Consultations.js";

/*
CREATE TABLE Evidences (
    Evidence_ID INT PRIMARY KEY AUTO_INCREMENT,
    Internal_ID CHAR(10) NOT NULL,
    Case_Code CHAR(50) NOT NULL,
    Activity_ID INT NOT NULL,
    Evidence_Name CHAR(250),
    Evidence_Document_Type LONGBLOB,
    Evidence_URL CHAR(255),
    Evidence_Date DATE
);
*/

export const Evidence = sequelize.define('Evidences', {
    Evidence_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Internal_ID: {
        type: DataTypes.CHAR(15),
        allowNull: false
    },
    Init_Code: {
        type: DataTypes.CHAR(50),
        allowNull: false
    },

    /*
    Activity_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    */

    Evidence_Name: DataTypes.STRING(250),
    Evidence_Document_Type: DataTypes.STRING(100),
    Evidence_URL: DataTypes.STRING(255),
    Evidence_Date: DataTypes.DATE,
    Evidence_File: {
        type: DataTypes.BLOB("long"),
        allowNull: false
    }
}, { timestamps: false });

// Define associations
Evidence.belongsTo(InitialConsultations, { foreignKey: "Init_Code" });

/*
Evidence.belongsTo(Activity, { foreignKey: "Activity_ID" });
*/

InitialConsultations.hasMany(Evidence, { foreignKey: "Init_Code" });

/*
Activity.hasMany(Evidence, { foreignKey: "Activity_ID" });
*/