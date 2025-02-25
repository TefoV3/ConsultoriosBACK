import { Router } from "express";
import { AsesoriaController } from "../controllers/AsesoriaController.js";

export const Asesoriarouter = Router();

Asesoriarouter.post("/asesorias", AsesoriaController.createAsesoria);
Asesoriarouter.put("/asesorias", AsesoriaController.updateAsesoria);
Asesoriarouter.delete("/asesorias/:Prim_Codigo", AsesoriaController.deleteAsesoria);
Asesoriarouter.get("/asesorias/:Prim_Codigo", AsesoriaController.getAsesoria);

export default Asesoriarouter;

