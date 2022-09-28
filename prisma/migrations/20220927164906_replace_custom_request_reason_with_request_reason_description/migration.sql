/*
  Warnings:

  - You are about to drop the column `customRequestReason` on the `PayrollAdvance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PayrollAdvance" DROP COLUMN "customRequestReason",
ADD COLUMN     "requestReasonDescription" TEXT;
