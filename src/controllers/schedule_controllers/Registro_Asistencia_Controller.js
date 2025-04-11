import { Registro_AsistenciaModel } from "../../models/schedule_models/Registro_Asistencia.js";

export class Registro_Asistencia_Controller {
    
        //Obtener registros activos
        static async getRegistros(req, res) {
            try {
                const registros = await Registro_AsistenciaModel.getRegistros();
                res.status(200).json(registros);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        }
    
        //Obtener un registro por ID, solo si no está eliminado
        static async getById(req, res) {
            try {
                const id = req.params.id;
                const registro = await Registro_AsistenciaModel.getById(id);
    
                if (!registro) {
                    res.status(404).json({ message: "Registro de asistencia no encontrado" });
                } else {
                    res.status(200).json(registro);
                }
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        }
    
        //Crear un nuevo registro
        static async create(req, res) {
            try {
                const data = req.body;
                const registro = await Registro_AsistenciaModel.create(data);
                res.status(201).json(registro);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        }

        static async createAsistenciaWithResumen(req, res) {
            try {
              const data = req.body;
              // Se espera que data incluya al menos:
              // { UsuarioXPeriodo_ID, Registro_Entrada, Registro_Salida, Registro_Tipo, Registro_fecha, ... }
              const registro = await Registro_AsistenciaModel.createAsistenciaWithResumen(data);
              res.status(201).json(registro);
            } catch (error) {
              res.status(500).json({ message: error.message });
            }
          }
          
    
        //Actualizar un registro solo si no está eliminado
        static async update(req, res) {
            try {
                const id = req.params.id;
                const data = req.body;
                const registro = await Registro_AsistenciaModel.update(id, data);
    
                if (!registro) {
                    res.status(404).json({ message: "Registro de asistencia no encontrado" });
                } else {
                    res.status(200).json(registro);
                }
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        }



        static async updateSalidaWithResumen(req, res) {
            try {
              const id = req.params.id; // ID del registro de asistencia
              const data = req.body;    // Debe incluir al menos { Registro_Salida: "fecha/hora" }
              const registro = await Registro_AsistenciaModel.updateSalidaWithResumen(id, data);
              if (!registro) {
                res.status(404).json({ message: "Registro de asistencia no encontrado" });
              } else {
                res.status(200).json(registro);
              }
            } catch (error) {
              res.status(500).json({ message: error.message });
            }
          }
          
    
        //Eliminar (marcar como eliminado) solo si no está eliminado
        static async delete(req, res) {
            try {
                const id = req.params.id;
                const registro = await Registro_AsistenciaModel.delete(id);
    
                if (!registro) {
                    res.status(404).json({ message: "Registro de asistencia no encontrado" });
                } else {
                    res.status(204).end();
                }
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        }

        static async getRegistroAbierto(req, res) {
            try {
              const usuarioXPeriodoId = req.query.usuarioxPeriodoId; // cambiar de req.params a req.query
              const fecha = req.query.fecha; // idem
              const registro = await Registro_AsistenciaModel.getRegistroAbierto(usuarioXPeriodoId, fecha);
          
              if (!registro) {
                res.status(404).json({ message: "Registro de asistencia no encontrado" });
              } else {
                res.status(200).json(registro);
              }
            } catch (error) {
              res.status(500).json({ message: error.message });
            }
          }

          static async getRegistrosAbiertos(req, res) {
            try {
              // los registros abiertos con la información del estudiante (a través de UsuarioXPeriodo)
              const registrosAbiertos = await Registro_AsistenciaModel.getRegistrosAbiertosConUsuario();
              if (!registrosAbiertos || registrosAbiertos.length === 0) {
                res.status(404).json({ message: "No se encontraron registros abiertos" });
              } else {
                res.status(200).json(registrosAbiertos);
              }
            } catch (error) {
              res.status(500).json({ message: error.message });
            }
          }

          static async getRegistrosCerrados(req, res) {
            try {
              const registrosCerrados = await Registro_AsistenciaModel.getRegistrosCerrados();
              res.status(200).json(registrosCerrados);
            } catch (error) {
              res.status(500).json({ message: error.message });
            }
          }

          static async updateCerradoConResumen(req, res) {
            try {
              const id = req.params.id;
              const data = req.body;
              const registro = await Registro_AsistenciaModel.updateCerradoConResumen(id, data);
              if (!registro) {
                res.status(404).json({ message: "Registro cerrado no encontrado" });
              } else {
                res.status(200).json(registro);
              }
            } catch (error) {
              res.status(500).json({ message: error.message });
            }
          }

          static async deleteConAjuste(req, res) {
            try {
              const id = req.params.id;
              const result = await Registro_AsistenciaModel.deleteConAjuste(id);
              if (!result) {
                res.status(404).json({ message: "Registro de asistencia no encontrado o no se pudo eliminar" });
              } else {
                res.status(200).json({ message: "Registro eliminado y resumen actualizado correctamente" });
              }
            } catch (error) {
              res.status(500).json({ message: error.message });
            }
          }
          
    }