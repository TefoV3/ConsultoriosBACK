import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";
import { Country } from "./Country.js"; // Importación de la tabla Country

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
    Country_ID: { // Clave foránea
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Country,
            key: 'Country_ID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
});

// Establece la relación con la tabla Country
City.belongsTo(Country, { foreignKey: "Country_ID" });
