import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";
import { SocialWork } from "./SocialWork.js";

export const LivingGroup = sequelize.define('LivingGroup', {
    LivingGroup_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Relationship: {
        type: DataTypes.STRING(50), // Describes the relationship (e.g., sibling, parent)
        allowNull: false
    },
    Occupation: {
        type: DataTypes.STRING(100), // The individual's occupation
        allowNull: true
    },
    ProcessNumber: {
        type: DataTypes.INTEGER,
        references: {
            model: SocialWork,
            key: 'ProcessNumber'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

// Establishing the relationship
SocialWork.hasMany(LivingGroup, {
    foreignKey: 'ProcessNumber',
    sourceKey: 'ProcessNumber'
});
LivingGroup.belongsTo(SocialWork, {
    foreignKey: 'ProcessNumber',
    targetKey: 'ProcessNumber'
});
