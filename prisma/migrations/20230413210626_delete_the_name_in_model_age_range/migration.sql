/*
  Warnings:

  - You are about to drop the column `name` on the `AgeRange` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AgeRange_name_key";

-- AlterTable
ALTER TABLE "AgeRange" DROP COLUMN "name";
