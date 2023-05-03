/*
  Warnings:

  - You are about to drop the `_AgeRangeToEmployeeGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EmployeeGroup" DROP CONSTRAINT "EmployeeGroup_countryId_fkey";

-- DropForeignKey
ALTER TABLE "_AgeRangeToEmployeeGroup" DROP CONSTRAINT "_AgeRangeToEmployeeGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "_AgeRangeToEmployeeGroup" DROP CONSTRAINT "_AgeRangeToEmployeeGroup_B_fkey";

-- AlterTable
ALTER TABLE "EmployeeGroup" ADD COLUMN     "ageRangeId" INTEGER,
ADD COLUMN     "salaryRangeId" INTEGER;

-- DropTable
DROP TABLE "_AgeRangeToEmployeeGroup";

-- AddForeignKey
ALTER TABLE "EmployeeGroup" ADD CONSTRAINT "EmployeeGroup_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeGroup" ADD CONSTRAINT "EmployeeGroup_ageRangeId_fkey" FOREIGN KEY ("ageRangeId") REFERENCES "AgeRange"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeGroup" ADD CONSTRAINT "EmployeeGroup_salaryRangeId_fkey" FOREIGN KEY ("salaryRangeId") REFERENCES "SalaryRange"("id") ON DELETE SET NULL ON UPDATE CASCADE;
