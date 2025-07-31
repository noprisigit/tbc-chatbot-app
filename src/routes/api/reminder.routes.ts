import { Router } from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware";
import { createNewReminder, deleteReminderById, getReminderById, getRemindersDataTable, updateReminderById, updateReminderStatusById } from "../../controllers/reminder.controller";

const router = Router();

router.get('/datatables', isAuthenticated, getRemindersDataTable);
router.post('/', isAuthenticated, createNewReminder);
router.get('/:id', isAuthenticated, getReminderById);
router.put('/:id', isAuthenticated, updateReminderById);
router.delete('/:id', isAuthenticated, deleteReminderById);
router.put('/:id/status', isAuthenticated, updateReminderStatusById);

export default router;