import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { recordLocationSchema } from '../validators/location.validator';

export async function recordLocation(req: AuthRequest, res: Response) {
  try {
    const parsed = recordLocationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const employeeId = req.user!.userId;
    const { latitude, longitude, taskId } = parsed.data;

    const location = await prisma.locationTracking.create({
      data: {
        employeeId,
        latitude,
        longitude,
        taskId: taskId || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Location recorded',
      data: { location },
    });
  } catch (error) {
    console.error('Record location error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function getActiveEmployeeLocations(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;

    const employees = await prisma.user.findMany({
      where: { companyId, role: { in: ['MANAGER', 'EMPLOYEE'] }, isActive: true },
      select: { id: true, firstName: true, lastName: true },
    });

    const employeeIds = employees.map((e: any) => e.id);

    const latestLocations = await prisma.locationTracking.findMany({
      where: { employeeId: { in: employeeIds } },
      orderBy: { createdAt: 'desc' },
      distinct: ['employeeId'],
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return res.status(200).json({
      success: true,
      data: { locations: latestLocations },
    });
  } catch (error) {
    console.error('Get active locations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function getEmployeeLocationHistory(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const employeeId = req.params.id as string;

    const employee = await prisma.user.findFirst({ where: { id: employeeId, companyId } });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const locations = await prisma.locationTracking.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.status(200).json({
      success: true,
      data: { locations },
    });
  } catch (error) {
    console.error('Get location history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function getTaskLocationHistory(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const taskId = req.params.taskId as string;

    const task = await prisma.task.findFirst({ where: { id: taskId, companyId } });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const locations = await prisma.locationTracking.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: { locations },
    });
  } catch (error) {
    console.error('Get task location history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}