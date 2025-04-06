import { UserModel } from "../models/UserModel.js";

export class UserController {
    static async getUsers(req, res) {
        try {
            const users = await UserModel.getAll();
            res.json(users);
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const user = await UserModel.getById(id);
            if (user) return res.json(user);
            res.status(404).json({ message: "User not found" });
        } catch (error) {
            res.status(500).json(error);
        }
    }

    static async getDocumentById(req, res) {
        const { id } = req.params;
        try {
            const documentResult = await UserModel.getDocumentById(id);
    
            if (!documentResult || !documentResult.User_HealthDocuments) {
                return res.status(404).json({ message: "Document not found" });
            }
    
            // Establece los encabezados para indicar que es un PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename=documento.pdf');
    
            // Envía el documento como respuesta binaria
            res.send(documentResult.User_HealthDocuments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    // Obtener User_ID desde SocialWork a través de Init_Code
    static async getUsersWithSocialWork(req, res) {
        try {
            const users = await UserModel.getUsersWithSocialWork();

            if (!users || users.length === 0) {
                return res.status(404).json({ message: "No users found with social work assistance." });
            }

            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
    static async createUser(req, res) {
        try {
            const internalId = req.headers["internal-id"]; // ✅ Se obtiene el usuario interno desde los headers
            const newUser = await UserModel.create(req.body);

            return res.status(201).json(newUser);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            //const internalId = req.headers["internal-id"];
            const file = req.file; // Capturamos el archivo enviado en la solicitud
    
            
    
            // Pasamos el archivo al modelo junto con los datos
            const updatedUser = await UserModel.update(id, req.body, file);
    
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }
    
            return res.json(updatedUser);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            //const internalId = req.headers["internal-id"];  // ✅ Se obtiene el usuario interno desde los headers

            

            const deletedUser = await UserModel.delete(id);

            if (!deletedUser) return res.status(404).json({ message: "Usuario no encontrado" });

            return res.json({ message: "Usuario eliminado lógicamente", usuario: deletedUser });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // static async uploadDocument(req, res) {
    //     try {
    //       const { id } = req.params;
    //       const internalId = req.headers["internal-id"];  // Se obtiene el usuario interno desde los headers
      
    //       console.log("Contenido de req.files:", req.files);
    //       console.log("Contenido de req.body:", req.body);
      
    //       // Extraer el archivo del campo "healthDocuments"
    //       const files = req.files;
    //       if (!files || !files.healthDocuments || files.healthDocuments.length === 0) {
    //         console.error("No se proporcionó ningún archivo en el campo 'healthDocuments'.");
    //         return res.status(400).json({ error: "No se proporcionó ningún archivo." });
    //       }
    //       const file = files.healthDocuments;
      
    //       if (!internalId) {
    //         console.error("El internal-id no está presente en los headers.");
    //         return res.status(400).json({ error: "El Internal_ID es obligatorio para registrar la acción" });
    //       }
      
    //       // Extraer el nombre personalizado del archivo del body (si se envió)
    //       const documentName = req.body.User_HealthDocumentsName || file.originalname;
      
    //       const updatedUser = await UserModel.uploadDocument(id, file, internalId, documentName);
      
    //       if (!updatedUser) {
    //         console.error("Usuario no encontrado con id:", id);
    //         return res.status(404).json({ message: "Usuario no encontrado" });
    //       }
      
    //       console.log("Documento subido correctamente para el usuario:", id);
    //       return res.json({ message: "Documento subido", usuario: updatedUser });
    //     } catch (error) {
    //       console.error("Error en el controlador uploadDocument:", error.message);
    //       return res.status(500).json({ error: error.message });
    //     }
    //   }
      
    static async uploadDocument(req, res) {
        try {
          const { id } = req.params;
          //const internalId = req.headers["internal-id"]; // Usuario interno desde headers
      
          console.log("Contenido de req.file:", req.file);
          console.log("Contenido de req.body:", req.body);
      
          // Extraer el archivo
          if (!req.file) {
            console.error("No se proporcionó ningún archivo.");
            return res.status(400).json({ error: "No se proporcionó ningún archivo." });
          }
      
          
      
          const file = req.file;
          const documentName = req.body.User_HealthDocumentsName;
          console.log("Nombre del documento:", documentName);
      
          // Llamar al modelo para guardar el archivo
          const updatedUser = await UserModel.uploadDocument(id, file, documentName);
      
          if (!updatedUser) {
            console.error("Usuario no encontrado con id:", id);
            return res.status(404).json({ message: "Usuario no encontrado" });
          }
      
          console.log("Documento subido correctamente para el usuario:", id);
          return res.json({ message: "Documento subido", usuario: updatedUser });
      
        } catch (error) {
          console.error("Error en el controlador uploadDocument:", error.message);
          return res.status(500).json({ error: error.message });
        }
      }
         
      


    static async deleteDocument(req, res) {
        try {
            const { id } = req.params;
            //const internalId = req.headers["internal-id"];  // ✅ Se obtiene el usuario interno desde los headers


            const deletedDocument = await UserModel.deleteDocument(id);

            if (!deletedDocument) return res.status(404).json({ message: "Documento no encontrado" });

            return res.json({ message: "Documento eliminado", documento: deletedDocument });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
