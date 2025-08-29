import { Router } from 'express';
import { getOverallBalance, getGroupSummary, getRecentExpenses, getTotalExpensesCount } from '../controllers/dashboard.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/balance').get(getOverallBalance);
router.route('/group-summary/:groupId').get(getGroupSummary);
router.route('/recent-expenses').get(getRecentExpenses);
router.route('/total-expenses-count').get(getTotalExpensesCount);

export default router;