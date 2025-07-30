import { NextFunction, Request, Response } from "express";
import { renderPage } from "../middlewares/renderPage";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcryptjs';

interface UserPayload {
  id: number;
  name: string;
  email: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

declare module 'express-session' {
  interface SessionData {
    user?: UserPayload;
  }
}

export const renderLoginPage = async (req: Request, res: Response, next: NextFunction) => {
  res.render('pages/auth/login', {
    title: 'Login',
    layout: false,
  });
}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as LoginPayload;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(422).render('pages/auth/login', {
        title: 'Login',
        errors: {},
        oldInput: { email }, 
        errorMessage: 'Email atau password yang Anda masukkan salah.',
        layout: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(422).render('pages/auth/login', {
        title: 'Login',
        errors: {},
        oldInput: { email }, 
        errorMessage: 'Email atau password yang Anda masukkan salah.',
        layout: false,
      });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    req.session.save(err => {
      if (err) {
        return next(err);
      }

      res.redirect('/dashboard');
    });
  } catch (err) {
    next(err);
  }
}