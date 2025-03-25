import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";
import { City } from "./City.js"; // Importar la tabla City

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
    City_ID: { // Clave foránea
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: City,
            key: 'City_ID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, { timestamps: false });

// Establecer la relación con la tabla City
Province.belongsTo(City, { foreignKey: "City_ID" });
