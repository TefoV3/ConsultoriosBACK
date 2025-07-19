import { SubjectModel } from "../../models/parameter_models/SubjectModel.js";

export class SubjectController {

    static async getAll(req, res) {
        try {
            const data = await SubjectModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await SubjectModel.getById(id);
            if (!data) return res.status(404).json({ message: "Subject not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            if (Array.isArray(req.body)) {
                const createdSubject = await SubjectModel.bulkCreate(req.body,internalId);
                return res.status(201).json(createdSubject);
            }
            // Si es un objeto, usa create normal
            const newSubject = await SubjectModel.create(req.body,internalId);
            res.status(201).json(newSubject);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const { id } = req.params;
            const updatedSubject = await SubjectModel.update(id, req.body, internalId);
            if (!updatedSubject) return res.status(404).json({ message: "Subject not found or no changes made" });
            res.status(200).json(updatedSubject);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

static async delete(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            const { id } = req.params; // This is Subject_ID

            // First, get the Subject to find its name, as Internal_Area is likely a name string
            const subjectToDelete = await SubjectModel.getById(id);
            if (!subjectToDelete) {
                return res.status(404).json({ message: "Subject not found" });
            }

            // Now, check if any InternalUser is associated with this Subject's name via Internal_Area
            const associatedUsersCount = await InternalUser.count({
                where: { Internal_Area: subjectToDelete.Subject_Name } // Compare with Subject_Name
            });

            if (associatedUsersCount > 0) {
                return res.status(400).json({ error: `No se puede eliminar la materia "${subjectToDelete.Subject_Name}" porque tiene usuarios asociados en esa área.` });
            }

            // If no users are associated, proceed with marking the subject as inactive
            const deletedSubject = await SubjectModel.delete(id,internalId);
            // The original check for deletedSubject is still valid, as SubjectModel.delete might return null
            if (!deletedSubject) return res.status(404).json({ message: "Subject not found or already inactive" }); // Adjusted message

            return res.status(200).json({ message: `Materia "${deletedSubject.Subject_Name}" eliminada (marcada como inactiva) correctamente.`, subject: deletedSubject });
        } catch (error) {
            console.error(`Error in delete subject for ID ${req.params.id}:`, error.message);
            res.status(500).json({ error: error.message });
        }
    }
}
