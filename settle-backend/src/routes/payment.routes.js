import { Router } from 'express';
import { settleUp } from '../controllers/payment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/settle/:groupId').post(settleUp);

export default router;