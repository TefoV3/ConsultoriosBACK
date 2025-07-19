import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Profiles } from "./parameter_tables/Profiles.js";

export const ProfileViewPermission = sequelize.define('Profile_View_Permission', {
    Permission_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Profile_ID: { // Foreign key to Profiles table
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Profiles,
            key: 'Profile_ID'
        }
    },
    View_Name: { // Ejemplo: 'Inicio', 'UserManagementView', 'SettingsView'
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Has_Permission: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: false,
    uniqueKeys: { // Ensures a profile cannot have duplicate view_name entries
        profile_view_unique: {
            fields: ['Profile_ID', 'View_Name']
        }
    }
});

//Relaciones
// Un perfil puede tener muchos permisos de vista, y un permiso de vista pertenece a un perfil.
Profiles.hasMany(ProfileViewPermission, {
    foreignKey: 'Profile_ID',
    sourceKey: 'Profile_ID',
    as: 'viewPermissions' // Optional alias
});
ProfileViewPermission.belongsTo(Profiles, {
    foreignKey: 'Profile_ID',
    targetKey: 'Profile_ID'
});