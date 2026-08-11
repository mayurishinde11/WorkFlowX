import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { checkInSchema, checkOutSchema } from '../validators/attendance.validator';

function getTodayDateOnly(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export async function checkIn(req: AuthRequest, res: Response) {
  try {
    const parsed = checkInSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const userId = req.user!.userId;
    const today = getTodayDateOnly();

    const existing = await prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already checked in today',
      });
    }

    const { latitude, longitude } = parsed.data;

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: today,
        checkIn: new Date(),
        checkInLat: latitude,
        checkInLng: longitude,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Checked in successfully',
      data: { attendance },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function checkOut(req: AuthRequest, res: Response) {
  try {
    const parsed = checkOutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const userId = req.user!.userId;
    const today = getTodayDateOnly();

    const existing = await prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'You have not checked in today',
      });
    }

    if (existing.checkOut) {
      return res.status(409).json({
        success: false,
        message: 'You have already checked out today',
      });
    }

    const { latitude, longitude } = parsed.data;
    const checkOutTime = new Date();
    const workingMinutes = Math.round(
      (checkOutTime.getTime() - new Date(existing.checkIn).getTime()) / 60000
    );

    const attendance = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkOut: checkOutTime,
        checkOutLat: latitude,
        checkOutLng: longitude,
        workingMinutes,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: { attendance },
    });
  } catch (error) {
    console.error('Check-out error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function getMyAttendance(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const records = await prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    });

    return res.status(200).json({
      success: true,
      data: { attendance: records },
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function getEmployeeAttendance(req: AuthRequest, res: Response) {
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

    const records = await prisma.attendance.findMany({
      where: { userId: employeeId },
      orderBy: { date: 'desc' },
      take: 30,
    });

    return res.status(200).json({
      success: true,
      data: { attendance: records },
    });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}