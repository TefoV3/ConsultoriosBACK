import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";
import { Zone } from "./Zone.js"; // Importar la tabla Zone

export const Sector = sequelize.define('Sector', {
    Sector_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Sector_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Sector_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    Zone_FK: { // Clave foránea de Zone
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Zone,
            key: 'Zone_Sector_ID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, { timestamps: false });

// Establecer la relación con la tabla Zone
Sector.belongsTo(Zone, { foreignKey: "Zone_ID" });
