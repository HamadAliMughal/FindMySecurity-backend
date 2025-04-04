import { Router } from 'express'
import { server } from '../bootstrap'
import * as Auth from './auth'
import * as Profile from './profile'


const router = Router()
router.post('/auth/register', Auth.registerRequest)
router.post('/auth/login',Auth.loginRequest)
router.get('/auth/check-email', Auth.checkEmailExists)
router.post('/auth/login/verify',Auth.verifyCode)

router.put('/profile/individual/:id', Profile.updateIndividualProfileRequest)

server.use('/api', router)
