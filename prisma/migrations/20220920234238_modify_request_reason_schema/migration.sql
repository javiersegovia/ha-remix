/*
  Warnings:

  - You are about to drop the column `payrollAdvanceId` on the `PayrollAdvanceRequestReason` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PayrollAdvanceRequestReason" DROP CONSTRAINT "PayrollAdvanceRequestReason_payrollAdvanceId_fkey";

-- DropIndex
DROP INDEX "PayrollAdvanceRequestReason_payrollAdvanceId_key";

-- AlterTable
ALTER TABLE "PayrollAdvance" ADD COLUMN     "requestReasonId" INTEGER;

-- AlterTable
ALTER TABLE "PayrollAdvanceRequestReason" DROP COLUMN "payrollAdvanceId";

-- AddForeignKey
ALTER TABLE "PayrollAdvance" ADD CONSTRAINT "PayrollAdvance_requestReasonId_fkey" FOREIGN KEY ("requestReasonId") REFERENCES "PayrollAdvanceRequestReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;
