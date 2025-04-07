import { DataTypes } from "sequelize";
import { InitialConsultations } from "./Initial_Consultations.js";
import { sequelize } from "../database/database.js";

export const SocialWork = sequelize.define('SocialWork', {
    SW_ProcessNumber: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    SW_UserRequests: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SW_ReferralAreaRequests: {
        type: DataTypes.TEXT,
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
    SW_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    Init_Code: { 
        type: DataTypes.CHAR(50),
        allowNull: false,
    }
}, { timestamps: false });
// Relación uno a uno
SocialWork.belongsTo(InitialConsultations, { foreignKey: "Init_Code" });
InitialConsultations.hasOne(SocialWork, { foreignKey: "Init_Code" });