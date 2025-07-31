import e, { NextFunction, Request, Response } from "express";
import { renderPage } from "../middlewares/renderPage";
import logger from "../lib/logger";
import { prisma } from "../lib/prisma";

export const renderCustomerPage = async (req: Request, res: Response, next: NextFunction) => {
  const pageContent = await renderPage('customer/customer.index');

  res.render('layout', {
    title: 'Manajemen Customer',
    body: pageContent
  });
}

export const getCustomersDataTable = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: customers });
  } catch (error) {
    logger.error(`GET /api/customers error : ${error}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const createNewCustomer = async (req: Request, res: Response) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  try {
    const newCustomer = await prisma.customer.create({
      data: { name, phone },
    });

    res.status(201).json(newCustomer);
  } catch (error: any) {
    console.error('POST /api/customers error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
}

export const updateCustomerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  try {
    const updatedCustomer = await prisma.customer.update({
      where: { id: Number(id) },
      data: { name, phone },
    });

    res.json(updatedCustomer);
  } catch (error: any) {
    console.error('PUT /api/customers/:id error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
}

export const deleteCustomerById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.customer.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/customers/:id error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
}

export const updateCustomerStatusById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
    });

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const updated = await prisma.customer.update({
      where: { id: Number(id) },
      data: {
        status: customer.status === 'active' ? 'inactive' : 'active',
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal ubah status' });
  }
}