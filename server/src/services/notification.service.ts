import prisma from '../lib/prisma';

type NotificationType =
  | 'NEW_TASK'
  | 'TASK_REASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_DUE_SOON'
  | 'ISSUE_REPORTED'
  | 'MANAGER_MESSAGE';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type as any,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}