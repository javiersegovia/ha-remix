-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "premiumDispersion" DOUBLE PRECISION,
ADD COLUMN     "premiumLastRequestDay" INTEGER DEFAULT 25,
ADD COLUMN     "premiumPaymentDays" INTEGER[];
