import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Social_Work } from "./Social_Work.js";

export const LivingGroup = sequelize.define('LivingGroup', {
    LG_LivingGroup_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    LG_Name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    LG_Age: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    LG_Relationship: {
        type: DataTypes.STRING(50), // Describes the relationship (e.g., sibling, parent)
        allowNull: true
    },
    LG_Occupation: {
        type: DataTypes.STRING(100), // The individual's occupation
        allowNull: true
    },
    LG_Notes: {
        type: DataTypes.TEXT, // Additional notes or observations about the individual
        allowNull: true
    },

    SW_ProcessNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: Social_Work,
            key: 'SW_ProcessNumber'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
}, { timestamps: false });

// Establishing the relationship
Social_Work.hasMany(LivingGroup, {
    foreignKey: 'SW_ProcessNumber',
});
LivingGroup.belongsTo(Social_Work, {
    foreignKey: 'SW_ProcessNumber',
});
