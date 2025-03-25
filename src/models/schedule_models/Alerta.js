import { Alerta } from '../../schemas/schedules_tables/Alerta_schema.js';

export class AlertaModel {
    
        static async getAlertas() {
            try{
                return await Alerta.findAll({ where: { Alerta_IsDeleted: false } });
            } catch (error) {
                throw new Error(`Error al obtener alertas: ${error.message}`);
            }
        }
    
        static async getById(id) {
            try{
                return await Alerta.findOne({
                    where: { Alerta_ID: id, Alerta_IsDeleted: false }
                });
            } catch (error) {
                throw new Error(`Error al obtener alerta: ${error.message}`);
            }
        }
    
        static async create(data) {
            try{
                return await Alerta.create(data);
            } catch (error) {
                throw new Error(`Error al crear alerta: ${error.message}`);
            }
        }
    
        static async update(id, data) {
            try{
                const alerta = await this.getById(id);
    
                if (!alerta) return null;
    
                const [rowsUpdated] = await Alerta.update(data, {
                    where: { Alerta_ID: id, Alerta_IsDeleted: false }
                });
    
                if (rowsUpdated === 0) return null;
                return await this.getById(id);
            } catch (error) {
                throw new Error(`Error al actualizar alerta: ${error.message}`);
            }
        }
    
        static async delete(id) {
            try{
                const alerta = await this.getById(id);
    
                if (!alerta) return null;
    
                await Alerta.update(
                    { Alerta_IsDeleted: true },
                    { where: { Alerta_ID: id, Alerta_IsDeleted: false } }
                );
                return alerta;
            } catch (error) {
                throw new Error(`Error al eliminar alerta: ${error.message}`);
            }
        }
    }