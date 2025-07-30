import { Router } from 'express';
import { loginUser, renderLoginPage } from '../../controllers/auth.controller';
import { loginValidationRules } from '../../validators/auth.validator';
import { createValidationMiddleware } from '../../middlewares/validationHandler';

const router = Router();

router.get('/login', renderLoginPage);
router.post('/login', loginValidationRules(), createValidationMiddleware('auth/login', 'Login', false), loginUser);

export default router;