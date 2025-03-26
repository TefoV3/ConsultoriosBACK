import { Router } from "express";
import { TypeOfAttentionController } from "../../controllers/parameter_controllers/TypeOfAttentionController.js";

export const TypeOfAttentionRouter = Router();

TypeOfAttentionRouter.get('/type-of-attention', TypeOfAttentionController.getAll);
TypeOfAttentionRouter.get('/type-of-attention/:id', TypeOfAttentionController.getById);
TypeOfAttentionRouter.post('/type-of-attention', TypeOfAttentionController.create);
TypeOfAttentionRouter.put('/type-of-attention/:id', TypeOfAttentionController.update);
TypeOfAttentionRouter.delete('/type-of-attention/:id', TypeOfAttentionController.delete);
