/*
  Warnings:

  - You are about to drop the column `stepToStep` on the `Benefit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Benefit" DROP COLUMN "stepToStep",
ADD COLUMN     "instructions" TEXT;
