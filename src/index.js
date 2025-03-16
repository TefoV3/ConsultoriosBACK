import app from "./app.js";
import { sequelize } from "./database/database.js";

import { Activity } from "./schemas/Actividad.js";
import { Assignment } from "./schemas/Assignment.js";
import { Case } from "./schemas/Case.js";
import { Evidence } from "./schemas/Evidences.js";
import { InitialConsultations } from "./schemas/Initial_Consultations.js";
import { InternalUser } from "./schemas/Internal_User.js";
import { User } from "./schemas/User.js";

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