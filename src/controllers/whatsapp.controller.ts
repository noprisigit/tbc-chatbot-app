import { NextFunction, Request, Response } from "express";
import { renderPage } from "../middlewares/renderPage";
import { getQrStatus, logoutWhatsapp } from "../services/whatsapp.service";

export const renderWhatsappPage = async (req: Request, res: Response, next: NextFunction) => {
  const pageContent = await renderPage('whatsapp/whatsapp.index');

  res.render('layout', {
    title: 'QR Code Whatsapp',
    body: pageContent
  });
}

export const getWhatsappQrCode = async (req: Request, res: Response) => {
  const status = getQrStatus();

  res.json(status);
}

export const processLogoutWhatsapp = async (req: Request, res: Response) => {
  await logoutWhatsapp();

  res.json({
    message: 'Logout berhasil, silahkan refresh halaman.'
  });
}