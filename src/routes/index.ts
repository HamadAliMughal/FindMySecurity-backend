import { Router } from 'express'
import { server } from '../bootstrap'
import * as Auth from './auth'


const router = Router()
router.post('/auth/register', Auth.registerRequest)
router.post('/auth/login',Auth.loginRequest)
router.post('/auth/login/verify',Auth.verifyCode)

server.use('/api', router)
