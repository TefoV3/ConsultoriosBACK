import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";
import { Subject } from "../../schemas/parameter_tables/Subject.js"; // Asegúrate de importar el modelo Subject

export const Topic = sequelize.define('Topic', {
    Topic_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Topic_Name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Subject_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Subjects', // Nombre de la tabla referenciada
            key: 'Subject_ID'
        }
    },
    Topic_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });

// Definir la relación entre Topic y Subject (Un Topic pertenece a un Subject)
Topic.belongsTo(Subject, {
    foreignKey: 'Subject_ID', // La clave foránea en la tabla Topic
    as: 'subject' // Nombre del alias de la relación
});
