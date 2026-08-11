-- CreateTable
CREATE TABLE "location_tracking" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "taskId" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "location_tracking_employeeId_idx" ON "location_tracking"("employeeId");

-- CreateIndex
CREATE INDEX "location_tracking_taskId_idx" ON "location_tracking"("taskId");

-- AddForeignKey
ALTER TABLE "location_tracking" ADD CONSTRAINT "location_tracking_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_tracking" ADD CONSTRAINT "location_tracking_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
