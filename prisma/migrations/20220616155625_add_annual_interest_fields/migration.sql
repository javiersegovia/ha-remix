-- AlterEnum
ALTER TYPE "PayrollAdvanceStatus" ADD VALUE 'DENIED';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "dispersion" DOUBLE PRECISION,
ADD COLUMN     "paymentDays" INTEGER[];

-- AlterTable
ALTER TABLE "PayrollAdvance" ADD COLUMN     "paymentDate" INTEGER,
ADD COLUMN     "paymentTermDays" INTEGER;

-- CreateTable
CREATE TABLE "PaymentSettings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "daysWithoutRequestsBeforePaymentDay" INTEGER NOT NULL,
    "annualInterestRate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PaymentSettings_pkey" PRIMARY KEY ("id")
);
