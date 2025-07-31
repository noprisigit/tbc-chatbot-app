import { Request, Response, Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import customerRoutes from './customer.routes';
import logRoutes from './log.routes';
import reminderRoutes from './reminder.routes';
import whatsappRoutes from './whatsapp.routes';
import { isAuthenticated } from '../../middlewares/authMiddleware';
import { renderDashboardPage } from '../../controllers/dashboard.controller';

const router = Router();

router.get('/', (req: Request, res: Response) => res.redirect('/dashboard'));
router.get('/dashboard', isAuthenticated, renderDashboardPage);

router.use('/', authRoutes);
router.use('/', adminRoutes);
router.use('/', customerRoutes);
router.use('/', reminderRoutes);
router.use('/', logRoutes);
router.use('/', whatsappRoutes);

export default router;