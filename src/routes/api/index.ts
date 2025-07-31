import { Router } from 'express';
import adminRoutes from './admin.routes';
import customerRoutes from './customer.routes';
import reminderRoutes from './reminder.routes';
import whatsappRoutes from './whatsapp.routes';

const router = Router();

router.use('/customers', customerRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/reminders', reminderRoutes);
router.use('/admins', adminRoutes);

export default router;