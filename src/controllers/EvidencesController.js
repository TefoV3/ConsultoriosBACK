import { EvidenceModel } from "../models/EvidencesModel.js";

export class EvidenceController {
  static async getEvidences(req, res) {
    try {
      const evidences = await EvidenceModel.getAll();
      res.json(evidences);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    try {
      const evidence = await EvidenceModel.getById(id);
      if (evidence) return res.json(evidence);
      res.status(404).json({ message: "Evidence not found" });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async getByConsultationsCode(req, res) {
    const { code } = req.params;
    try {
      const evidence = await EvidenceModel.getByConsultationsCode(code);
      if (evidence) return res.json(evidence);
      res.status(404).json({ message: "Evidence not found" });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  static async getDocumentById(req, res) {
    const { id } = req.params;
    try {
      const documentResult = await EvidenceModel.getDocumentById(id);

      if (!documentResult || !documentResult.Evidence_File) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Establece los encabezados para indicar que es un PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=documento.pdf");

      // Envía el documento como respuesta binaria
      res.send(documentResult.Evidence_File);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async uploadEvidence(req, res) {
    try {
      console.log("req.body:", req.body);
      console.log("req.file:", req.file);

      // Si no se recibió archivo, se asigna un objeto vacío
      const file = req.file || { mimetype: null, path: null, buffer: null };

      const { Internal_ID, Init_Code, Evidence_Name } = req.body;

      const newEvidence = await EvidenceModel.create(
        {
          Internal_ID,
          Init_Code,
          Evidence_Name: Evidence_Name || "Sin Documento", // Si se envió vacío, se asigna un nombre predeterminado
        },
        file
      );

      res.status(201).json({
        message: "Evidencia subida correctamente",
        data: newEvidence,
      });
    } catch (error) {
      console.error("Error en uploadEvidence:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async downloadEvidence(req, res) {
    try {
      const { id } = req.params;
      const evidence = await EvidenceModel.getEvidenceById(id);

      if (!evidence) {
        return res.status(404).json({ error: "Evidencia no encontrada." });
      }

      res.set({
        "Content-Type": evidence.Evidence_Document_Type,
        "Content-Disposition": `attachment; filename=${evidence.Evidence_Name}`,
      });

      res.send(evidence.Evidence_File);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updatedEvidence = await EvidenceModel.update(id, req.body);
      if (!updatedEvidence)
        return res.status(404).json({ message: "Evidence not found" });

      return res.json(updatedEvidence);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedEvidence = await EvidenceModel.delete(id);
      if (!deletedEvidence)
        return res.status(404).json({ message: "Evidence not found" });

      return res.json({
        message: "Evidence deleted",
        evidence: deletedEvidence,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

    static async uploadNewDocument(req, res) {
    try {
      const { id } = req.params;

      console.log("Contenido de req.file:", req.file);
      console.log("Contenido de req.body:", req.body);

      // Extraer el archivo
      if (!req.file) {
        console.error("No se proporcionó ningún archivo.");
        return res.status(400).json({ error: "No se proporcionó ningún archivo." });
      }

      const file = req.file;
      const documentName = req.body.Evidence_Name;

      // Llamar al modelo para guardar el archivo
      const updatedEvidence = await EvidenceModel.uploadDocument(id, file, documentName);

      if (!updatedEvidence) {
        console.error("Evidencia no encontrada con id:", id);
        return res.status(404).json({ message: "Evidencia no encontrada" });
      }

      console.log("Documento subido correctamente para la evidencia:", id);
      return res.json({ message: "Documento subido", evidencia: updatedEvidence });

    } catch (error) {
      console.error("Error en el controlador uploadDocument:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }









  static async deleteDocument(req, res) {
    try {
      const { id } = req.params;
      const internalId = req.headers["internal-id"]; // ✅ Se obtiene el usuario interno desde los headers

      if (!internalId) {
        return res
          .status(400)
          .json({
            error: "El Internal_ID es obligatorio para registrar la acción",
          });
      }

      const deletedDocument = await EvidenceModel.deleteDocument(
        id,
        internalId
      );

      if (!deletedDocument)
        return res.status(404).json({ message: "Documento no encontrado" });

      return res.json({
        message: "Documento eliminado",
        documento: deletedDocument,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
