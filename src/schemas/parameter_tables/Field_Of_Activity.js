import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";
import { Type_Of_Activity } from "./Type_Of_Activity.js"; // Asegúrate de importar el modelo

export const Field_Of_Activity = sequelize.define('Field_Of_Activity', {
    Field_Of_Activity_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Field_Of_Activity_Name: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    Field_Of_Activity_Type: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    Type_Of_Activity_FK: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Type_Of_Activity,
            key: 'Type_Of_Activity_Id'
        }
    },
    Field_Of_Activity_Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, { timestamps: false });

// Relación entre Type_Of_Activity y Field_Of_Activity
Field_Of_Activity.belongsTo(Type_Of_Activity, {
    foreignKey: 'Type_Of_Activity_FK',
    as: 'type_of_activity'
});
Type_Of_Activity.hasMany(Field_Of_Activity, {
    foreignKey: 'Type_Of_Activity_FK',
    as: 'fields_of_activity'
});