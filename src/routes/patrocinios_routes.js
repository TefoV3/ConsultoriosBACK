import { Router } from "express";
import { PatrocinioController } from "../controllers/PatrocinioController.js";

export const Patrociniorouter = Router();

Patrociniorouter.post("/patrocinios", PatrocinioController.createPatrocinio);
Patrociniorouter.get("/patrocinios/:Prim_Codigo", PatrocinioController.getPatrocinio);
Patrociniorouter.put("/patrocinios", PatrocinioController.updatePatrocinio);
Patrociniorouter.delete("/patrocinios/:Prim_Codigo", PatrocinioController.deletePatrocinio);

export default Patrociniorouter;
