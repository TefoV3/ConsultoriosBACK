import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { SocialWork } from "./SocialWork.js";

export const LivingGroup = sequelize.define('LivingGroup', {
    LG_LivingGroup_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    LG_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    LG_Age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    LG_Relationship: {
        type: DataTypes.STRING(50), // Describes the relationship (e.g., sibling, parent)
        allowNull: false
    },
    LG_Occupation: {
        type: DataTypes.STRING(100), // The individual's occupation
        allowNull: true
    },
    LG_Notes: DataTypes.TEXT,

    SW_ProcessNumber: {
        type: DataTypes.INTEGER,
        references: {
            model: SocialWork,
            key: 'SW_ProcessNumber'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    LG_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });

// Establishing the relationship
SocialWork.hasMany(LivingGroup, {
    foreignKey: 'SW_ProcessNumber',
});
LivingGroup.belongsTo(SocialWork, {
    foreignKey: 'SW_ProcessNumber',
});
