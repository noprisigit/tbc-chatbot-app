import { Router } from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware";
import { renderCustomerPage } from "../../controllers/customer.controller";

const router = Router();

router.get('/customers', isAuthenticated, renderCustomerPage);

export default router;