import { getDashboardSummary } from '@/controllers/DashboardHomeController';
import { authenticateToken } from '@/middlewares/authMiddleware';
import Router from 'express';

const router = Router ();

router.get('/summary',authenticateToken, getDashboardSummary)

export default router