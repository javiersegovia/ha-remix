/*
  Warnings:

  - You are about to drop the column `employeeGroupId` on the `Employee` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_employeeGroupId_fkey";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "employeeGroupId";

-- CreateTable
CREATE TABLE "_EmployeeToEmployeeGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EmployeeToEmployeeGroup_AB_unique" ON "_EmployeeToEmployeeGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_EmployeeToEmployeeGroup_B_index" ON "_EmployeeToEmployeeGroup"("B");

-- AddForeignKey
ALTER TABLE "_EmployeeToEmployeeGroup" ADD CONSTRAINT "_EmployeeToEmployeeGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToEmployeeGroup" ADD CONSTRAINT "_EmployeeToEmployeeGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "EmployeeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
