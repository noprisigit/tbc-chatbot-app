import { Router } from "express";
import { isAuthenticated } from "../../middlewares/authMiddleware";
import { createNewCustomer, deleteCustomerById, getCustomersDataTable, updateCustomerById, updateCustomerStatusById } from "../../controllers/customer.controller";

const router = Router();

router.get('/datatables', isAuthenticated, getCustomersDataTable);
router.post('/', isAuthenticated, createNewCustomer);
router.put('/:id', isAuthenticated, updateCustomerById);
router.delete('/:id', isAuthenticated, deleteCustomerById);
router.put('/:id/status', isAuthenticated, updateCustomerStatusById);

export default router;