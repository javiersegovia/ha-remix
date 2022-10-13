/*
  Warnings:

  - Added the required column `companyId` to the `PremiumAdvance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PremiumAdvance" ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "employeeId" TEXT;

-- AddForeignKey
ALTER TABLE "PremiumAdvance" ADD CONSTRAINT "PremiumAdvance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumAdvance" ADD CONSTRAINT "PremiumAdvance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
