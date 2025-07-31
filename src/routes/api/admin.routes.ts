import { Router } from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware";
import { createNewAdmin, deleteAdminById, getAdminsDataTable, updateAdminById, updateAdmintatusById } from "../../controllers/admin.controller";

const router = Router();

router.get('/datatables', isAuthenticated, getAdminsDataTable);
router.post('/', isAuthenticated, createNewAdmin);
router.put('/:id', isAuthenticated, updateAdminById);
router.delete('/:id', isAuthenticated, deleteAdminById);
router.put('/:id/status', isAuthenticated, updateAdmintatusById);

export default router;