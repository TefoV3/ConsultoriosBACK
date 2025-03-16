import app from "./app.js";
import { sequelize } from "./database/database.js";

import { Activity } from "./schemas/Actividad.js";
import { Assignment } from "./schemas/Asignacion.js";
import { Case } from "./schemas/Caso.js";
import { Evidence } from "./schemas/Evidencias.js";
import { InitialConsultations } from "./schemas/Primeras_consultas.js";
import { InternalUser } from "./schemas/Usuario_interno.js";
import { User } from "./schemas/Usuario.js";

async function main(){
   try { 
      await sequelize.sync();
      app.listen(3000, () => {
         console.log("Server running on port 3000")
      })
   } catch (error) {
      console.error("Error starting server: ", error)
   }
}

main()