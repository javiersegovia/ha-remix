/*
  Warnings:

  - The `instructions` column on the `Benefit` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Benefit" DROP COLUMN "instructions",
ADD COLUMN     "instructions" TEXT[];
