import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer.validator';

export async function createCustomer(req: AuthRequest, res: Response) {
  try {
    const parsed = createCustomerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const companyId = req.user!.companyId;

    const customer = await prisma.customer.create({
      data: {
        companyId,
        ...parsed.data,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: { customer },
    });
  } catch (error) {
    console.error('Create customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function getCustomers(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const search = req.query.search as string | undefined;

    const customers = await prisma.customer.findMany({
      where: {
        companyId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: { customers },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function getCustomerById(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const id = req.params.id as string;

    const customer = await prisma.customer.findFirst({
      where: { id, companyId },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { customer },
    });
  } catch (error) {
    console.error('Get customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function updateCustomer(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const id = req.params.id as string;

    const parsed = updateCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const existingCustomer = await prisma.customer.findFirst({ where: { id, companyId } });
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: parsed.data,
    });

    return res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: { customer: updatedCustomer },
    });
  } catch (error) {
    console.error('Update customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function deleteCustomer(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const id = req.params.id as string;

    const existingCustomer = await prisma.customer.findFirst({ where: { id, companyId } });
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    await prisma.customer.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}