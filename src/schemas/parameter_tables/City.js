import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";
import { Province } from "./Province.js"; 

export const City = sequelize.define('City', {
    City_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    City_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    City_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    Province_FK: { // Clave foránea
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Province,
            key: 'Province_ID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, { timestamps: false });

// Establece la relación con la tabla 
City.belongsTo(Province, { foreignKey: "Province_ID" });
