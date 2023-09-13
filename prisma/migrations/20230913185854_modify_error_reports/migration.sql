/*
  Warnings:

  - You are about to drop the `UploadEmployeeErrorReport` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ErrorReportType" AS ENUM ('UPLOAD_EMPLOYEE');

-- DropForeignKey
ALTER TABLE "UploadEmployeeErrorReport" DROP CONSTRAINT "UploadEmployeeErrorReport_adminUserId_fkey";

-- DropForeignKey
ALTER TABLE "UploadEmployeeErrorReport" DROP CONSTRAINT "UploadEmployeeErrorReport_employeeId_fkey";

-- DropTable
DROP TABLE "UploadEmployeeErrorReport";

-- CreateTable
CREATE TABLE "ErrorReport" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "details" JSONB NOT NULL,
    "type" "ErrorReportType" NOT NULL,
    "employeeId" TEXT,
    "adminUserId" TEXT,

    CONSTRAINT "ErrorReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ErrorReport" ADD CONSTRAINT "ErrorReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorReport" ADD CONSTRAINT "ErrorReport_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
