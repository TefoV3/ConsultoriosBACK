import app from "./app.js";
import { sequelize } from "./database/database.js";

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