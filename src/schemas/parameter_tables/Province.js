import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";
import { Country } from "./Country.js"; 

export const Province = sequelize.define('Province', {
    Province_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Province_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Province_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    Country_FK: { // Clave foránea
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Country,
            key: 'Country_ID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, { timestamps: false });

// Establecer la relación con la tabla Country
Province.belongsTo(Country, { foreignKey: "Country_ID" });
