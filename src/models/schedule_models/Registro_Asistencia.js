import { Registro_Asistencia } from "../../schemas/schedules_tables/Registro_Asistencia_Schema.js";
import { Op } from "sequelize";
 
 export class Registro_AsistenciaModel {
  
     //Obtener registros activos
     static async getRegistros() {
         try {
             return await Registro_Asistencia.findAll({
                 where: { Registro_IsDeleted: false }
             });
         } catch (error) {
             throw new Error(`Error al obtener registros de asistencia: ${error.message}`);
         }
     }
 
     //Obtener un registro por ID, solo si no está eliminado
     static async getById(id) {
         try {
             return await Registro_Asistencia.findOne({
                 where: { Registro_ID: id, Registro_IsDeleted: false }
             });
         } catch (error) {
             throw new Error(`Error al obtener registro de asistencia: ${error.message}`);
         }
     }
 
     //Crear un nuevo registro
     static async create(data) {
         try {
             return await Registro_Asistencia.create(data);
         } catch (error) {
            console.log('Error:', error);
             throw new Error(`Error al crear registro de asistencia: ${error.message}`);
         }
     }
 
     //Actualizar un registro solo si no está eliminado
     static async update(id, data) {
         try {
             const registro = await this.getById(id);
 
             if (!registro) return null;
 
             const [rowsUpdated] = await Registro_Asistencia.update(data, {
                 where: { Registro_ID: id, Registro_IsDeleted: false }
             });
 
             if (rowsUpdated === 0) return null;
             return await this.getById(id);
         } catch (error) {
             throw new Error(`Error al actualizar registro de asistencia: ${error.message}`);
         }
     }
 
     //Eliminar (marcar como eliminado) solo si no está eliminado
     static async delete(id) {
         try {
             const registro = await this.getById(id);
 
             if (!registro) return null;
 
             const data = { Registro_IsDeleted: true };
             const [rowsUpdated] = await Registro_Asistencia.update(data, {
                 where: { Registro_ID: id, Registro_IsDeleted: false }
             });
 
             if (rowsUpdated === 0) return null;
             return true;
         } catch (error) {
             throw new Error(`Error al eliminar registro de asistencia: ${error.message}`);
         }
     }
 
        // Nuevo método: Obtener el registro abierto para un usuario x período
    // Si se pasa la fecha, se filtra entre el inicio y fin del día
    static async getRegistroAbierto(usuarioXPeriodoId, fecha) {
        try {
            //fecha quemada para pruebas 24 de marzo 2025
            //fecha = '2025-03-24';

            fecha = '2025-03-24';

          // Asumimos que 'fecha' es una cadena "YYYY-MM-DD" en UTC
          const start = new Date(fecha);
          start.setUTCHours(0, 0, 0, 0);
          const end = new Date(fecha);
          end.setUTCHours(23, 59, 59, 999);
      
          const whereClause = {
            UsuarioXPeriodo_ID: usuarioXPeriodoId,  // Nombre exacto del campo en el modelo
            Registro_IsDeleted: false,
            Registro_Salida: null,
            Registro_Entrada: { [Op.between]: [start, end] }
          };
          console.log('Where:', whereClause);
      
          return await Registro_Asistencia.findOne({ where: whereClause });
        } catch (error) {
            console.log('Error:', error);
          throw new Error(`Error al obtener registro abierto: ${error.message}`);
        }
      }
 
     
 }