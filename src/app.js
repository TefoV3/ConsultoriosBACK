import express from 'express'

import {UsuarioRouter} from './routes/usuario_routes.js'



const app = express()



// middleware

app.use(express.json())

//app.use(corsMiddleware())

app.use(UsuarioRouter)



export default app