import { TopicModel } from "../../models/parameter_models/TopicModel.js";

export class TopicController {

    static async getAll(req, res) {
        try {
            const data = await TopicModel.getAll();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await TopicModel.getById(id);
            if (!data) return res.status(404).json({ message: "Topic not found" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const internalId = req.headers["internal-id"]
            if (Array.isArray(req.body)) {
                const createdTopic = await TopicModel.bulkCreate(req.body,internalId);
                return res.status(201).json(createdTopic);
            }
            // Si es un objeto, usa create normal
            const newTopic = await TopicModel.create(req.body,internalId);
            res.status(201).json(newTopic);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getBySubjectId(req, res) {
        try {
            const { subjectId } = req.params;
            const data = await TopicModel.getBySubjectId(subjectId);
            if (!data) return res.status(404).json({ message: "No topics found for this subject" });
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"]
            const updatedTopic = await TopicModel.update(id, req.body, internalId);
            if (!updatedTopic) return res.status(404).json({ message: "Topic not found or no changes made" });
            res.status(200).json(updatedTopic);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const internalId = req.headers["internal-id"]
            const deletedTopic = await TopicModel.delete(id, internalId);
            if (!deletedTopic) return res.status(404).json({ message: "Topic not found" });
            res.status(200).json(deletedTopic);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
