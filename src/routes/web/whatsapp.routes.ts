import { Router } from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware";
import { renderWhatsappPage } from "../../controllers/whatsapp.controller";

const router = Router();

router.get('/whatsapp', isAuthenticated, renderWhatsappPage);

export default router;