import { Router } from 'express'
import { server } from '../bootstrap'
import * as Auth from './auth'


const router = Router()
router.post('/auth/register', Auth.registerRequest)


server.use('/api', router)
