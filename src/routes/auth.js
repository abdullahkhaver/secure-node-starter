import { Router } from 'express';
import { body } from 'express-validator';
import * as ctrl from '../controllers/authController.js';

const router = Router();

router.post(
  '/register',
  body('username').isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  ctrl.register,
);

router.post(
  '/login',
  body('email').isEmail(),
  body('password').exists(),
  ctrl.login,
);

router.post('/refresh', ctrl.refreshToken);
router.post('/logout', ctrl.logout);

export default router;
