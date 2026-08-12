import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import cloudinary from '../config/cloudinary';

export async function uploadAttachment(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const userId = req.user!.userId;
    const taskId = req.params.taskId as string;
    const type = (req.body.type as string) || 'OTHER';

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const task = await prisma.task.findFirst({ where: { id: taskId, companyId } });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `workflowx/tasks/${taskId}` },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result as { secure_url: string });
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    const attachment = await prisma.taskAttachment.create({
      data: {
        taskId,
        fileUrl: uploadResult.secure_url,
        fileName: req.file.originalname,
        type: type as any,
        uploadedById: userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: { attachment },
    });
  } catch (error) {
    console.error('Upload attachment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong during upload',
    });
  }
}

export async function getTaskAttachments(req: AuthRequest, res: Response) {
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

    const attachments = await prisma.taskAttachment.findMany({
      where: { taskId },
      include: { uploadedBy: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: { attachments },
    });
  } catch (error) {
    console.error('Get attachments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}

export async function deleteAttachment(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user!.companyId;
    const id = req.params.id as string;

    const attachment = await prisma.taskAttachment.findFirst({
      where: { id, task: { companyId } },
    });

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found',
      });
    }

    await prisma.taskAttachment.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully',
    });
  } catch (error) {
    console.error('Delete attachment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
}