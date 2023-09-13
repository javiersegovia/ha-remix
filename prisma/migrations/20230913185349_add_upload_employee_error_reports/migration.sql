-- CreateTable
CREATE TABLE "UploadEmployeeErrorReport" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "details" JSONB NOT NULL,
    "employeeId" TEXT,
    "adminUserId" TEXT,

    CONSTRAINT "UploadEmployeeErrorReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UploadEmployeeErrorReport" ADD CONSTRAINT "UploadEmployeeErrorReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadEmployeeErrorReport" ADD CONSTRAINT "UploadEmployeeErrorReport_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
