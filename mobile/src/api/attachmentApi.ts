import apiClient from './client';

export interface Attachment {
  id: string;
  fileUrl: string;
  fileName: string;
  type: 'BEFORE' | 'DURING' | 'AFTER' | 'OTHER';
  createdAt: string;
  uploadedBy: { firstName: string; lastName: string };
}

export async function uploadAttachmentRequest(
  taskId: string,
  imageUri: string,
  type: string
): Promise<{ success: boolean; data: { attachment: Attachment } }> {
  const formData = new FormData();
  formData.append('photo', {
    uri: imageUri,
    type: 'image/jpeg',
    name: `photo_${Date.now()}.jpg`,
  } as any);
  formData.append('type', type);

  const response = await apiClient.post(`/attachments/tasks/${taskId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getTaskAttachmentsRequest(
  taskId: string
): Promise<{ success: boolean; data: { attachments: Attachment[] } }> {
  const response = await apiClient.get(`/attachments/tasks/${taskId}`);
  return response.data;
}