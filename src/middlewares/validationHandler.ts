import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { renderPage } from "./renderPage";

/**
 * Membuat middleware validasi yang dapat digunakan kembali.
 * @param view - Nama file EJS yang akan dirender jika ada error (cth: 'login' atau 'register').
 * @param pageTitle - Judul halaman yang akan dikirim ke view.
 * @returns Express middleware function.
 */
export const createValidationMiddleware = (view: string, pageTitle: string = "", isLayout: boolean = true) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: { [key: string]: string } = {};
    errors.array().forEach(err => {
      if ('path' in err) {
        extractedErrors[err.path] = err.msg;
      }
    });

    if (!isLayout) {
      return res.render(`pages/${view}`, {
        title: pageTitle || "",
        errors: extractedErrors,
        oldInput: req.body,
        errorMessage: 'Data yang Anda masukkan tidak valid. Silahkan periksa kembali.',
        layout: false,
      });
    } else {
      const pageContent = await renderPage(view);

      return res.render('layout', {
        title: pageTitle || "",
        body: pageContent, 
        errors: extractedErrors,
        oldInput: req.body,
        errorMessage: 'Data yang Anda masukkan tidak valid. Silahkan periksa kembali.',
      });
    }

  }
}