import { NextFunction, Request, Response } from "express";
import { renderPage } from "../middlewares/renderPage";
import { prisma } from "../lib/prisma";
import logger from "../lib/logger";
import { hashPassword } from "../lib/hashPassword";

export const renderAdminPage = async (req: Request, res: Response, next: NextFunction) => {
  const pageContent = await renderPage('admin/admin.index');

  res.render('layout', {
    title: 'Manajemen Admin',
    body: pageContent
  });
}

export const getAdminsDataTable = async (req: Request, res: Response) => {
  try {
    const admins = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: admins });
  } catch (error) {
    logger.error(`GET /api/customers error : ${error}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const createNewAdmin = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nama, Email dan Password wajib diisi' });
  }

  try {
    const hashed = await hashPassword(password);
    const newAdmin = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    res.status(201).json(newAdmin);
  } catch (error: any) {
    console.error('POST /api/admins error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
}

export const updateAdminById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nama dan Email wajib diisi' });
  }

  try {
    const admin = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin tidak ditemukan' });
    }

    const hashed = password ? await hashPassword(password) : admin.password;

    const updatedAdmin = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, email, password: hashed },
    });

    res.json(updatedAdmin);
  } catch (error: any) {
    console.error('PUT /api/admins/:id error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
}

export const deleteAdminById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/admins/:id error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
}

export const updateAdmintatusById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const admin = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!admin) return res.status(404).json({ error: 'Admin tidak ditemukan' });

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        status: admin.status === 'active' ? 'inactive' : 'active',
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal ubah status' });
  }
}