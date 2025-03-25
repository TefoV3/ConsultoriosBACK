import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

/*
CREATE TABLE Alerta (
    Alerta_ID INT AUTO_INCREMENT PRIMARY KEY,
    Alerta_msj VARCHAR(300) NOT NULL,
    Alerta_tipo VARCHAR(60) NOT NULL,
    Alerta_aprob VARCHAR(10) NOT NULL,
    Alerta_IsDeleted BOOLEAN DEFAULT FALSE
);
*/

export const Alerta = sequelize.define('Alerta', {
    Alerta_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Alerta_msj: {
        type: DataTypes.STRING(300),
        allowNull: false
    },
    Alerta_tipo: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    Alerta_aprob: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    Alerta_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});