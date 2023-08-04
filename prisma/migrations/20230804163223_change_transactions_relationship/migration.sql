/*
  Warnings:

  - You are about to drop the column `companyPointsId` on the `PointTransaction` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `PointTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PointTransaction" DROP CONSTRAINT "PointTransaction_companyPointsId_fkey";

-- AlterTable
ALTER TABLE "PointTransaction" DROP COLUMN "companyPointsId",
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
