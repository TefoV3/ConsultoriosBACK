import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";

/*
CREATE TABLE Horas_Extraordinarias (
    Horas_ID INT AUTO_INCREMENT PRIMARY KEY,
    Usuario_Cedula VARCHAR(13),
    Horas_Num DECIMAL(5,2),
    Horas_Aprobado_Por VARCHAR(100),
    Horas_Tipo VARCHAR(100),
    Horas_Fecha DATE,
    Horas_Comentario TEXT,
    Horas_IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (Usuario_Cedula) REFERENCES Usuario(Usuario_Cedula) ON DELETE RESTRICT
);
*/

export const Horas_Extraordinarias = sequelize.define('Horas_Extraordinarias', {
    Horas_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Internal_ID: { 
        type: DataTypes.STRING(13),
        allowNull: false
    },
    Horas_Num: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false
    },
    Horas_Aprobado_Por: {
        type: DataTypes.STRING(100)
    },
    Horas_Tipo: {
        type: DataTypes.STRING(100)
    },
    Horas_Fecha: {
        type: DataTypes.DATE
    },
    Horas_Comentario: {
        type: DataTypes.TEXT
    },
    Horas_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});