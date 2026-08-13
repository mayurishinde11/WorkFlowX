import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalEmployees,
      activeEmployees,
      totalTasks,
      pendingTasks,
      activeTasks,
      completedToday,
      overdueTasks,
      tasksByStatus,
      tasksByPriority,
    ] = await Promise.all([
      prisma.user.count({ where: { companyId, role: { in: ['MANAGER', 'EMPLOYEE'] } } }),
      prisma.user.count({
        where: { companyId, role: { in: ['MANAGER', 'EMPLOYEE'] }, isActive: true },
      }),
      prisma.task.count({ where: { companyId } }),
      prisma.task.count({ where: { companyId, status: 'PENDING' } }),
      prisma.task.count({
        where: { companyId, status: { in: ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'] } },
      }),
      prisma.task.count({
        where: { companyId, status: 'COMPLETED', completedAt: { gte: startOfToday } },
      }),
      prisma.task.count({
        where: {
          companyId,
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
          dueDate: { lt: new Date() },
        },
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: { companyId },
        _count: true,
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: { companyId },
        _count: true,
      }),
    ]);

    const totalCompletedOrCancelled = await prisma.task.count({
      where: { companyId, status: { in: ['COMPLETED', 'CANCELLED'] } },
    });
    const totalCompleted = await prisma.task.count({
      where: { companyId, status: 'COMPLETED' },
    });
    const completionRate =
      totalCompletedOrCancelled > 0
        ? Math.round((totalCompleted / totalCompletedOrCancelled) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        totalTasks,
        pendingTasks,
        activeTasks,
        completedToday,
        overdueTasks,
        completionRate,
        tasksByStatus: tasksByStatus.map((t) => ({ status: t.status, count: t._count })),
        tasksByPriority: tasksByPriority.map((t) => ({ priority: t.priority, count: t._count })),
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}