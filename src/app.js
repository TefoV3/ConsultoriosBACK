import express from 'express'
import cookieParser from 'cookie-parser'
import {ActividadRouter} from './routes/actividad_routes.js'
import {AsignacionRouter} from './routes/asignacion_routes.js'
import {CasoRouter} from './routes/caso_routes.js'
import {EvidenciaRouter} from './routes/evidencias_routes.js'
import {PrimerasConsultasRouter} from './routes/primeras_consultas_routes.js'
import {UsuarioInternoRouter} from './routes/usuario_interno_routes.js'
import {UsuarioRouter} from './routes/usuario_routes.js'
import { corsMiddleware } from './middlewares/cors.js'
import authRoutes from './routes/auth_routes.js'

const app = express()
// middleware

app.use(express.json())
app.use(cookieParser())
app.use(corsMiddleware())
app.use(authRoutes);

app.use(ActividadRouter)
app.use(AsignacionRouter)
app.use(CasoRouter)
app.use(EvidenciaRouter)
app.use(PrimerasConsultasRouter)
app.use(UsuarioInternoRouter)
app.use(UsuarioRouter)



export default app