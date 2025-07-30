import { body } from "express-validator";

export const loginValidationRules = () => {
  return [
    body('email')
      .notEmpty()
      .withMessage('Email tidak boleh kosong')
      .isEmail()
      .withMessage('Format email tidak valid.')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password tidak boleh kosong')
  ]
}