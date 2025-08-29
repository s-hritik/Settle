import { Router } from 'express';
import { getExpensesByGroup, addExpenseToGroup, getGroupAnalytics } from '../controllers/expense.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyJWT);

router.route('/analytics/:groupId').get(getGroupAnalytics);

router.route('/group/:groupId')
    .get(getExpensesByGroup)
    .post(addExpenseToGroup);

export default router;