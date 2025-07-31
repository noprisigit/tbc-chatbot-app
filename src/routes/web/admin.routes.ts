import { Router } from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware";
import { renderAdminPage } from "../../controllers/admin.controller";

const router = Router();

router.get('/admins', isAuthenticated, renderAdminPage);

export default router;