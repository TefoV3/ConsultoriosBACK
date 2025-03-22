import express from 'express'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth_routes.js'

import {ActivityRouter} from './routes/activity_routes.js'
import {AssignmentRouter} from './routes/assignment_routes.js'
import {EvidenceRouter} from './routes/evidences_routes.js'
import {InitialConsultationsRouter} from './routes/initial_consultations_routes.js'
import {InternalUserRouter} from './routes/internal_user_routes.js'
import {UserRouter} from './routes/user_routes.js'
import { AuditRouter } from './routes/audit_routes.js'
import { corsMiddleware } from './middlewares/cors.js'

//Parameter Routes
import { CaseStatusRouter } from './routes/parameter_routes/case_status_routes.js'
import { CatastrophicIllnessRouter } from './routes/parameter_routes/catastrophic_illness_routes.js'
import { DisabilityRouter } from './routes/parameter_routes/disability_routes.js'
import { ProfilesRouter } from './routes/parameter_routes/profiles_routes.js'
import { ScheduleRouter } from './routes/parameter_routes/schedule_routes.js'
import { ProtocolsRouter } from './routes/parameter_routes/protocols_routes.js'
import { TypeOfAttentionRouter } from './routes/parameter_routes/type_of_attention_routes.js'
import { VulnerableSituationRouter } from './routes/parameter_routes/vulnerable_situation_routes.js'

const app = express()

// middleware
app.use(express.json())
app.use(cookieParser())
app.use(corsMiddleware())
app.use(authRoutes);

//app.use(corsMiddleware())
app.use(ActivityRouter)
app.use(AssignmentRouter)
app.use(EvidenceRouter)
app.use(InitialConsultationsRouter)
app.use(InternalUserRouter)
app.use(UserRouter)
app.use(AuditRouter)

//Parameter Routes
app.use(CaseStatusRouter)
app.use(CatastrophicIllnessRouter)
app.use(DisabilityRouter)
app.use(ProfilesRouter)
app.use(ScheduleRouter)
app.use(ProtocolsRouter)
app.use(TypeOfAttentionRouter)
app.use(VulnerableSituationRouter)


export default app