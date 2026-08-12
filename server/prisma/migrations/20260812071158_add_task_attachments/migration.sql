-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('BEFORE', 'DURING', 'AFTER', 'OTHER');

-- CreateTable
CREATE TABLE "task_attachments" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL DEFAULT 'OTHER',
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_attachments_taskId_idx" ON "task_attachments"("taskId");

-- AddForeignKey
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
