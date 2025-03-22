import { Router } from "express";
import { TypeOfAttentionController } from "../../controllers/parameter_controllers/TypeOfAttentionController.js";

export const TypeOfAttentionRouter = Router();

TypeOfAttentionRouter.get('/tipo_de_atencion', TypeOfAttentionController.getAll);
TypeOfAttentionRouter.get('/tipo_de_atencion/:id', TypeOfAttentionController.getById);
TypeOfAttentionRouter.post('/tipo_de_atencion', TypeOfAttentionController.create);
TypeOfAttentionRouter.put('/tipo_de_atencion/:id', TypeOfAttentionController.update);
TypeOfAttentionRouter.delete('/tipo_de_atencion/:id', TypeOfAttentionController.delete);
