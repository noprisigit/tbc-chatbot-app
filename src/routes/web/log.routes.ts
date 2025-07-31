import { Router } from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware";
import { renderLogPage } from "../../controllers/log.controller";

const router = Router();

router.get('/logs', isAuthenticated, renderLogPage);

export default router;