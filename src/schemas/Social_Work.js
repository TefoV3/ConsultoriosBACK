import { DataTypes } from "sequelize";
import { InitialConsultations } from "./Initial_Consultations.js";
import { sequelize } from "../database/database.js";

export const Social_Work = sequelize.define('Social_Work', {
    SW_ProcessNumber: {
        type: DataTypes.STRING(50),
        primaryKey: true,
    },
    SW_UserRequests: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SW_ReferralAreaRequests: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SW_EntryDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    SW_ViolenceEpisodes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SW_Complaints: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SW_DisabilityType: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    SW_DisabilityPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    SW_HasDisabilityCard: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    SW_ViolenceEpisodes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SW_Complaints: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SW_AlcoholConsumption: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SW_DrugConsumption: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SW_WorkAdress: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    SW_HomeAdress: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    SW_ReferencePhone: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    SW_Income: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    SW_HousingType: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    SW_CounterpartName: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    SW_CounterpartAge: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    SW_CounterpartMaritalStatus: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    SW_CounterpartOccupation: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    SW_CounterpartAddress: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    SW_CounterpartPhone: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    SW_CounterpartID: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    SW_CounterpartRelation: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    SW_PreviouslyKnownCase: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SW_Status: {
        type: DataTypes.STRING(20),
        defaultValue: "Activo"
    },
    Init_Code: { 
        type: DataTypes.CHAR(50),
        allowNull: false,
    },
    SW_Notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SW_Observations: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SW_Status_Observations: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SW_LastTimeUpdated: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, { timestamps: false });
// Relación uno a uno
Social_Work.belongsTo(InitialConsultations, { foreignKey: "Init_Code" });
InitialConsultations.hasOne(Social_Work, { foreignKey: "Init_Code" });