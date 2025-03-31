import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";


export const Parametro_Horario = sequelize.define('Parametro_Horario', {
    Parametro_Horario_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Parametro_Horario_Hora_Entrada: {
        type: DataTypes.TIME,
        allowNull: false
    },
    Parametro_Horario_Hora_Salida: {
        type: DataTypes.TIME,
        allowNull: false
    },
    Parametro_Horario_Tipo: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    Parametro_Horario_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});