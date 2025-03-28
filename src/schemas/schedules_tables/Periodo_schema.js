import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";
/*
CREATE TABLE Periodos (
    Periodo_ID INT AUTO_INCREMENT PRIMARY KEY,
    Periodo_Inicio DATE,
    Periodo_Fin DATE,
    Periodo_Total_Horas INT,
    Periodo_IsDeleted BOOLEAN DEFAULT FALSE
);
*/
//TODO: Agregar PeriodoNombre con inicializacion en bd
export const Periodo = sequelize.define('Periodo', {
    Periodo_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    PeriodoNombre: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    PeriodoTipo: {
        type: DataTypes.STRING(50),
        allowNull:false
    },
    Periodo_Inicio: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Periodo_Fin: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Periodo_Total_Horas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    Periodo_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// Relación N:M con Usuario a través de UsuarioXPeriodo
//Periodo.belongsToMany(Usuario, { through: UsuarioXPeriodo, foreignKey: 'Periodo_ID' });