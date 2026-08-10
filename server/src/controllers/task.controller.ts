import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  updateTaskStatusSchema,
} from '../validators/task.validator';

const taskInclude = {
  customer: { select: { id: true, name: true, address: true, phone: true } },
  assignedTo: { select: { id: true, firstName: true, lastName: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true } },
};

export async function createTask(req: AuthRequest, res: Response) {
  try {
    const parsed = createTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const companyId = req.user!.companyId;
    const createdById = req.user!.userId;
    const { title, description, customerId, assignedToId, priority, dueDate, estimatedDuration } =
      parsed.data;

    const customer = await prisma.customer.findFirst({ where: { id: customerId, companyId } });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    if (assignedToId) {
      const employee = await prisma.user.findFirst({ where: { id: assignedToId, companyId } });
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Assigned employee not found',
        });
      }
    }

    const task = await prisma.task.create({
      data: {
        companyId,
        title,
        description,
        customerId,
        assignedToId: assignedToId || null,
        createdById,
        priority: priority || 'MEDIUM',
        status: assignedToId ? 'ASSIGNED' : 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedDuration,
      },
      include: taskInclude,
    });

    await prisma.taskStatusHistory.create({
      data: {
        taskId: task.id,
        status: task.status,
        changedById: createdById,
        notes: 'Task created',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function getTasks(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const role = req.user!.role;
    const userId = req.user!.userId;

    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    const assignedToId = req.query.assignedToId as string | undefined;

    const tasks = await prisma.task.findMany({
      where: {
        companyId,
        ...(role === 'EMPLOYEE' ? { assignedToId: userId } : {}),
        ...(status ? { status: status as any } : {}),
        ...(priority ? { priority: priority as any } : {}),
        ...(assignedToId ? { assignedToId } : {}),
      },
      include: taskInclude,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: { tasks },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function getTaskById(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const role = req.user!.role;
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const task = await prisma.task.findFirst({
      where: {
        id,
        companyId,
        ...(role === 'EMPLOYEE' ? { assignedToId: userId } : {}),
      },
      include: {
        ...taskInclude,
        statusHistory: {
          include: { changedBy: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    console.error('Get task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function updateTask(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const id = req.params.id as string;

    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const existingTask = await prisma.task.findFirst({ where: { id, companyId } });
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const { dueDate, ...rest } = parsed.data;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
      },
      include: taskInclude,
    });

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask },
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
  ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export async function assignTask(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const parsed = assignTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { assignedToId } = parsed.data;

    const task = await prisma.task.findFirst({ where: { id, companyId } });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const employee = await prisma.user.findFirst({ where: { id: assignedToId, companyId } });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { assignedToId, status: 'ASSIGNED' },
      include: taskInclude,
    });

    await prisma.taskStatusHistory.create({
      data: {
        taskId: id,
        status: 'ASSIGNED',
        changedById: userId,
        notes: `Assigned to ${employee.firstName} ${employee.lastName}`,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Task assigned successfully',
      data: { task: updatedTask },
    });
  } catch (error) {
    console.error('Assign task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function updateTaskStatus(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const role = req.user!.role;
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const parsed = updateTaskStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { status: newStatus, notes } = parsed.data;

    const task = await prisma.task.findFirst({
      where: {
        id,
        companyId,
        ...(role === 'EMPLOYEE' ? { assignedToId: userId } : {}),
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const allowedNextStatuses = VALID_TRANSITIONS[task.status] || [];
    if (!allowedNextStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${task.status} to ${newStatus}`,
      });
    }

    const updateData: any = { status: newStatus };
    if (newStatus === 'IN_PROGRESS' && !task.startedAt) {
      updateData.startedAt = new Date();
    }
    if (newStatus === 'COMPLETED') {
      updateData.completedAt = new Date();
      if (task.startedAt) {
        const durationMs = new Date().getTime() - new Date(task.startedAt).getTime();
        updateData.actualDuration = Math.round(durationMs / 60000);
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: taskInclude,
    });

    await prisma.taskStatusHistory.create({
      data: {
        taskId: id,
        status: newStatus,
        changedById: userId,
        notes,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: { task: updatedTask },
    });
  } catch (error) {
    console.error('Update task status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}