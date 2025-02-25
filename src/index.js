import app from "./app.js";
import { sequelize } from "./database/database.js";

import { Actividad } from "./schemas/Actividad.js";
import { Asignacion } from "./schemas/Asignacion.js";
import { Caso } from "./schemas/Caso.js";
import { Evidencia } from "./schemas/Evidencias.js";
import { PrimerasConsultas } from "./schemas/Primeras_consultas.js";
import { UsuarioInterno } from "./schemas/Usuario_interno.js";
import { Usuario } from "./schemas/Usuario.js";

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