import { Profiles } from "../schemas/parameter_tables/Profiles.js";
import { ProfileViewPermission } from "../schemas/Profile_View_Permission.js";
import { sequelize } from "../database/database.js";
import { AuditModel } from "../models/AuditModel.js";
import { InternalUser } from "../schemas/Internal_User.js";

const ALL_APPLICATION_VIEWS = [

    // Admin / Gestión de Casos
    "CaseReview",
    "CaseAssign",
    "AssignedCases",
    "AllCases",

    // Admin / Gestión de Parámetros y Roles
    "Parameter",
    "RoleView", // La vista para gestionar roles

    // Admin / Gestión de Usuarios
    "UserView", // Cubre /Usuarios y /Usuarios/:id
    "NewUser",

    // Admin / Trabajo Social
    "SocialWorkSchedule",
    "SocialWorkNewCase",
    "SocialWorkCases",

    // Casos (General)
    "NewCase",
    "MyCases",
    "CreateActivities",
    "CaseNotifications",

    // Reportes de Casos
    "ExcelReport",

    // Control de Ingreso / Cronograma
    "Cronograma",
    "IngresoCronograma", // Cubre la creación y edición
    "PeriodoSemanal",

    // Control de Ingreso / Estudiantes
    "AsignacionPeriodo",
    "IngresoEstudiantesExcel",
    "IngresoManualEstudiantes",
    "ListadoEstudiantes",
    "RemoverPeriodo",

    // Control de Ingreso / Horario
    "IngresoArea",
    "IngresoHorario",
    "IngresoHorarioVirtual",
    "VistaHorarios",
    "VistaHorariosPersonal", // Específico de Estudiante

    // Control de Ingreso / Biometría y Asistencia
    "AsignacionHuella",
    "RegistroHuella",
    "RegistroPorCedula",
    "RegistroManual",
    "RegistrosAbiertos",
    "RegistrosCerrados",
    "ModificacionHoras",
    "SeguimientoGeneral",
    "ResumenSemanal", // Ruta con parámetros, pero el acceso es único
    "ResumenSemanalEstudiante", // Específico de Estudiante

    // Vistas específicas de Estudiante
    "RegistroVirtual",

    // Alertas
    "AlertasView",
];

export class ProfilePermissionModel {

    /**
     * Obtiene la lista de permisos para un perfil específico.
     * @param {string} profileId - El ID del perfil.
     * @returns {Promise<Array>} - Un array de objetos { View_Name, Has_Permission }.
     */
    static async getByProfileId(profileId) {
        try {
            const profile = await Profiles.findByPk(profileId);
            if (!profile) {
                throw new Error("Perfil no encontrado.");
            }
            
            // El admin siempre tiene todos los permisos, no se gestionan en la BD.
            if (profile.Profile_Name === "Administrador") {
                return ALL_APPLICATION_VIEWS.map(viewName => ({
                    View_Name: viewName,
                    Has_Permission: true,
                }));
            }

            const existingPermissions = await ProfileViewPermission.findAll({
                where: { Profile_ID: profileId },
            });

            const permissionsMap = new Map(
                existingPermissions.map(p => [p.View_Name, p.Has_Permission])
            );

            // Combina las vistas de la app con los permisos existentes.
            const allPermissions = ALL_APPLICATION_VIEWS.map(viewName => ({
                View_Name: viewName,
                Has_Permission: permissionsMap.get(viewName) || false, // Default a false
            }));

            return allPermissions;

        } catch (error) {
            console.error(`Error en ProfilePermissionModel.getByProfileId: ${error.message}`);
            throw error; // Propaga el error para que el controlador lo maneje
        }
    }

    /**
     * Actualiza los permisos para un perfil específico.
     * @param {string} profileId - El ID del perfil.
     * @param {Array} permissionsToUpdate - Array de { View_Name, Has_Permission }.
     * @returns {Promise<Object>} - Mensaje de éxito.
     */
    static async updateByProfileId(profileId, permissionsToUpdate, internalUser) {
        const transaction = await sequelize.transaction();
        const internalId = internalUser || getUserId();

        try {
            const profile = await Profiles.findByPk(profileId, { transaction });
            if (!profile) {
                throw new Error("Perfil no encontrado.");
            }

            if (profile.Profile_Name === "Administrador") {
                throw new Error("Los permisos del perfil Administrador no pueden ser modificados.");
            }
            
            if (!Array.isArray(permissionsToUpdate)) {
                throw new Error("El formato de datos es inválido, se esperaba un array.");
            }

            for (const perm of permissionsToUpdate) {
                 if (!ALL_APPLICATION_VIEWS.includes(perm.View_Name)) {
                    console.warn(`Intento de actualizar permiso para vista no reconocida: ${perm.View_Name}. Se omitirá.`);
                    continue;
                }
                
                await ProfileViewPermission.upsert({
                    Profile_ID: parseInt(profileId, 10),
                    View_Name: perm.View_Name,
                    Has_Permission: perm.Has_Permission
                }, { transaction });
            }

            await transaction.commit();

            // Obtener información del usuario interno para auditoría
            let adminInfo = { name: 'Usuario Desconocido', role: 'Rol no especificado', area: 'Área no especificada' };
            try {
                const admin = await InternalUser.findOne({
                    where: { Internal_ID: internalId },
                    attributes: ["Internal_Name", "Internal_LastName", "Internal_Type", "Internal_Area"]
                });
                if (admin) {
                    adminInfo = {
                        name: `${admin.Internal_Name} ${admin.Internal_LastName}`,
                        role: admin.Internal_Type || 'Rol no especificado',
                        area: admin.Internal_Area || 'Área no especificada'
                    };
                }
            } catch (err) {
                console.warn("No se pudo obtener información del administrador para auditoría:", err.message);
            }

            await AuditModel.registerAudit(
                internalId, 
                "UPDATE",
                "Profile_View_Permission",
                `${adminInfo.name} (${adminInfo.role} - ${adminInfo.area}) actualizó los permisos del perfil ${profile.Profile_Name}`
            );
            return { message: `Permisos para el perfil '${profile.Profile_Name}' actualizados.` };


        } catch (error) {
            await transaction.rollback();
            console.error(`Error en ProfilePermissionModel.updateByProfileId: ${error.message}`);
            throw error;
        }
    }
}