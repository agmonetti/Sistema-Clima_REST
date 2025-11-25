import {verifyToken} from '../middlewares/auth.middleware.js';
import { Router } from 'express';
import { register, login, latido } from '../controllers/auth.controller.js';

const router = Router();


router.post('/register', register); // POST /api/auth/register
router.post('/login', login);       // POST /api/auth/login
router.post('/ping', verifyToken, latido); // POST /api/auth/ping
export default router;