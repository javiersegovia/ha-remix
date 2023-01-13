/*
  Warnings:

  - You are about to drop the `PayrollAdvanceRequestReason` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PayrollAdvance" DROP CONSTRAINT "PayrollAdvance_requestReasonId_fkey";

-- AlterTable
ALTER TABLE "GlobalSettings" ADD COLUMN     "transportationAid" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PremiumAdvance" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "deniedAt" TIMESTAMP(3),
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "requestReasonDescription" TEXT,
ADD COLUMN     "requestReasonId" INTEGER,
ADD COLUMN     "requestedAmount" DOUBLE PRECISION,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "totalAmount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PayrollAdvanceRequestReason" RENAME TO "RequestReason";

-- CreateTable
CREATE TABLE "PremiumAdvanceBankAccount" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "currencyName" TEXT,
    "bankName" TEXT NOT NULL,
    "bankFeeName" TEXT,
    "bankFeeValue" DOUBLE PRECISION,
    "bankFeeValueType" TEXT,
    "identityDocumentValue" TEXT NOT NULL,
    "identityDocumentType" TEXT NOT NULL,
    "premiumAdvanceId" TEXT NOT NULL,

    CONSTRAINT "PremiumAdvanceBankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumAdvanceTax" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "premiumAdvanceId" TEXT NOT NULL,

    CONSTRAINT "PremiumAdvanceTax_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PremiumAdvanceBankAccount_premiumAdvanceId_key" ON "PremiumAdvanceBankAccount"("premiumAdvanceId");

-- AddForeignKey
ALTER TABLE "PayrollAdvance" ADD CONSTRAINT "PayrollAdvance_requestReasonId_fkey" FOREIGN KEY ("requestReasonId") REFERENCES "RequestReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumAdvance" ADD CONSTRAINT "PremiumAdvance_requestReasonId_fkey" FOREIGN KEY ("requestReasonId") REFERENCES "RequestReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumAdvanceBankAccount" ADD CONSTRAINT "PremiumAdvanceBankAccount_premiumAdvanceId_fkey" FOREIGN KEY ("premiumAdvanceId") REFERENCES "PremiumAdvance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumAdvanceTax" ADD CONSTRAINT "PremiumAdvanceTax_premiumAdvanceId_fkey" FOREIGN KEY ("premiumAdvanceId") REFERENCES "PremiumAdvance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
