import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { hashPassword } from '../utils/password';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/employee.validator';
import { createAuditLog } from '../services/auditLog.service';

export async function createEmployee(req: AuthRequest, res: Response) {
  try {
    const parsed = createEmployeeSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const companyId = req.user!.companyId;
    const createdById = req.user!.userId;
    const { firstName, lastName, email, password, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const passwordHash = await hashPassword(password);

    const employee = await prisma.user.create({
      data: {
        companyId,
        firstName,
        lastName,
        email,
        passwordHash,
        role,
      },
    });

    await createAuditLog({
      companyId,
      userId: createdById,
      action: 'CREATE',
      entity: 'Employee',
      entityId: employee.id,
      metadata: { firstName, lastName, email, role },
    });
    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          role: employee.role,
          isActive: employee.isActive,
          createdAt: employee.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Create employee error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function getEmployees(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;

    const employees = await prisma.user.findMany({
      where: {
        companyId,
        role: { in: ['MANAGER', 'EMPLOYEE'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: { employees },
    });
  } catch (error) {
    console.error('Get employees error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function getEmployeeById(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const id = req.params.id as string;

    const employee = await prisma.user.findFirst({
      where: { id, companyId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { employee },
    });
  } catch (error) {
    console.error('Get employee error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function updateEmployee(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const id = req.params.id as string;

    const parsed = updateEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const existingEmployee = await prisma.user.findFirst({ where: { id, companyId } });
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const updatedEmployee = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: { employee: updatedEmployee },
    });
  } catch (error) {
    console.error('Update employee error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function deactivateEmployee(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const id = req.params.id as string;

    const existingEmployee = await prisma.user.findFirst({ where: { id, companyId } });
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const updatedEmployee = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully',
      data: { employee: updatedEmployee },
    });
  } catch (error) {
    console.error('Deactivate employee error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}