-- CreateEnum
CREATE TYPE "DataItemType" AS ENUM ('DATE', 'TEXT', 'NUMBER');

-- AlterTable
ALTER TABLE "Benefit" ADD COLUMN     "notificationEmails" TEXT[],
ADD COLUMN     "requireDataItems" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sendEmailNotifications" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DataItem" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "DataItemType" NOT NULL,
    "benefitId" INTEGER NOT NULL,

    CONSTRAINT "DataItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DataItem" ADD CONSTRAINT "DataItem_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "Benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
