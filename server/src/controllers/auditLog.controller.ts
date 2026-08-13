import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

export async function getAuditLogs(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;

    const logs = await prisma.auditLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.status(200).json({
      success: true,
      data: { logs },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}