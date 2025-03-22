import { TopicModel } from "../../models/parameter_tables/TopicModel.js";

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
            const newTopic = await TopicModel.create(req.body);
            res.status(201).json(newTopic);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updatedTopic = await TopicModel.update(id, req.body);
            if (!updatedTopic) return res.status(404).json({ message: "Topic not found or no changes made" });
            res.status(200).json(updatedTopic);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedTopic = await TopicModel.delete(id);
            if (!deletedTopic) return res.status(404).json({ message: "Topic not found" });
            res.status(200).json(deletedTopic);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
