import { Router } from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware";
import { getWhatsappQrCode, processLogoutWhatsapp } from "../../controllers/whatsapp.controller";

const router = Router();

router.get('/qr', isAuthenticated, getWhatsappQrCode);
router.post('/logout', isAuthenticated, processLogoutWhatsapp);

export default router;