import express from 'express'
import {ActivityRouter} from './routes/activity_routes.js'
import {AssignmentRouter} from './routes/assignment_routes.js'
import {CaseRouter} from './routes/case_routes.js'
import {EvidenceRouter} from './routes/evidences_routes.js'
import {InitialConsultationsRouter} from './routes/initial_consultations_routes.js'
import {InternalUserRouter} from './routes/internal_user_routes.js'
import {UserRouter} from './routes/user_routes.js'

const app = express()
// middleware

app.use(express.json())

//app.use(corsMiddleware())
app.use(ActivityRouter)
app.use(AssignmentRouter)
app.use(CaseRouter)
app.use(EvidenceRouter)
app.use(InitialConsultationsRouter)
app.use(InternalUserRouter)
app.use(UserRouter)


export default app