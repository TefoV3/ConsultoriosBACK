import { ProfileViewPermission, Internal_User } from '../models/index.js';
import { Profiles } from '../schemas/parameter_tables/Profiles.js';

/**
 * NOTA IMPORTANTE: Es un Middleware para verificar permisos de vista específicos aplicados a cada ruta de ser necesario.
 * Cabe recalcar que no se encuentra aplicado a ninguna ruta de momento, pero de ser necesario se la puede usar.
 * @param {string} requiredView - Nombre de la vista requerida
 * @returns {Function} Middleware function
 */
export const requirePermission = (requiredView) => {
  return async (req, res, next) => {
    try {
      const user = req.user; // Usuario viene del middleware de autenticación
      
      if (!user) {
        return res.status(401).json({ 
          message: 'Usuario no autenticado',
          code: 'UNAUTHORIZED'
        });
      }

      // Los administradores siempre tienen acceso
      if (user.Internal_Type === 'Administrador') {
        return next();
      }

      // Obtener el profile_id del usuario
      const userData = await Internal_User.findByPk(user.Internal_ID);
      if (!userData || !userData.profile_id) {
        return res.status(403).json({ 
          message: 'Usuario sin perfil asignado',
          code: 'NO_PROFILE'
        });
      }

      // Verificar permiso específico
      const permission = await ProfileViewPermission.findOne({
        where: {
          Profile_ID: userData.profile_id,
          View_Name: requiredView,
          Has_Permission: true
        }
      });

      if (!permission) {
        return res.status(403).json({ 
          message: `No tienes permisos para acceder a ${requiredView}`,
          requiredPermission: requiredView,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    } catch (error) {
      console.error('Error verificando permisos:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (OR logic)
 * El usuario necesita al menos uno de los permisos especificados
 */
export const requireAnyPermission = (requiredViews) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ 
          message: 'Usuario no autenticado',
          code: 'UNAUTHORIZED'
        });
      }

      // Los administradores siempre tienen acceso
      if (user.Internal_Type === 'Administrador') {
        return next();
      }

      const userData = await Internal_User.findByPk(user.Internal_ID);
      if (!userData || !userData.profile_id) {
        return res.status(403).json({ 
          message: 'Usuario sin perfil asignado',
          code: 'NO_PROFILE'
        });
      }

      // Verificar si tiene al menos uno de los permisos
      const permissions = await ProfileViewPermission.findAll({
        where: {
          Profile_ID: userData.profile_id,
          View_Name: requiredViews,
          Has_Permission: true
        }
      });

      if (permissions.length === 0) {
        return res.status(403).json({ 
          message: `No tienes permisos para acceder a esta funcionalidad`,
          requiredPermissions: requiredViews,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    } catch (error) {
      console.error('Error verificando permisos:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (AND logic)
 * El usuario necesita TODOS los permisos especificados
 */
export const requireAllPermissions = (requiredViews) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ 
          message: 'Usuario no autenticado',
          code: 'UNAUTHORIZED'
        });
      }

      // Los administradores siempre tienen acceso
      if (user.Internal_Type === 'Administrador') {
        return next();
      }

      const userData = await Internal_User.findByPk(user.Internal_ID);
      if (!userData || !userData.profile_id) {
        return res.status(403).json({ 
          message: 'Usuario sin perfil asignado',
          code: 'NO_PROFILE'
        });
      }

      // Verificar que tenga TODOS los permisos
      const permissions = await ProfileViewPermission.findAll({
        where: {
          Profile_ID: userData.profile_id,
          View_Name: requiredViews,
          Has_Permission: true
        }
      });

      if (permissions.length !== requiredViews.length) {
        return res.status(403).json({ 
          message: `No tienes todos los permisos necesarios para acceder a esta funcionalidad`,
          requiredPermissions: requiredViews,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    } catch (error) {
      console.error('Error verificando permisos:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};