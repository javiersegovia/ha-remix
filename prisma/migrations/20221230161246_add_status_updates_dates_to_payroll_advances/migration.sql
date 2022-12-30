-- AlterTable
ALTER TABLE "PayrollAdvance" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "deniedAt" TIMESTAMP(3),
ADD COLUMN     "paidAt" TIMESTAMP(3);
