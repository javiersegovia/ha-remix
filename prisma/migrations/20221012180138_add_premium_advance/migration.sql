-- CreateEnum
CREATE TYPE "PremiumAdvanceStatus" AS ENUM ('REQUESTED', 'APPROVED', 'PAID', 'CANCELLED', 'DENIED');

-- CreateEnum
CREATE TYPE "PremiumAdvanceHistoryActor" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "PremiumAdvance" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "PayrollAdvanceStatus" NOT NULL DEFAULT 'REQUESTED',

    CONSTRAINT "PremiumAdvance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumAdvanceHistory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "toStatus" "PremiumAdvanceStatus" NOT NULL,
    "actor" "PremiumAdvanceHistoryActor" NOT NULL,
    "premiumAdvanceId" TEXT NOT NULL,
    "employeeId" TEXT,
    "adminUserId" TEXT,

    CONSTRAINT "PremiumAdvanceHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PremiumAdvanceHistory" ADD CONSTRAINT "PremiumAdvanceHistory_premiumAdvanceId_fkey" FOREIGN KEY ("premiumAdvanceId") REFERENCES "PremiumAdvance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumAdvanceHistory" ADD CONSTRAINT "PremiumAdvanceHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumAdvanceHistory" ADD CONSTRAINT "PremiumAdvanceHistory_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
