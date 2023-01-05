/*
  Warnings:

  - You are about to drop the column `salary` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Benefit" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "salary";
