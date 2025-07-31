import { Router } from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware";
import { renderReminderPage } from "../../controllers/reminder.controller";

const router = Router();

router.get('/reminders', isAuthenticated, renderReminderPage);

export default router;