-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "employeeGroupId" TEXT;

-- CreateTable
CREATE TABLE "EmployeeGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "EmployeeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BenefitToEmployee" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BenefitToEmployeeGroup" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BenefitToEmployee_AB_unique" ON "_BenefitToEmployee"("A", "B");

-- CreateIndex
CREATE INDEX "_BenefitToEmployee_B_index" ON "_BenefitToEmployee"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BenefitToEmployeeGroup_AB_unique" ON "_BenefitToEmployeeGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_BenefitToEmployeeGroup_B_index" ON "_BenefitToEmployeeGroup"("B");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_employeeGroupId_fkey" FOREIGN KEY ("employeeGroupId") REFERENCES "EmployeeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeGroup" ADD CONSTRAINT "EmployeeGroup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BenefitToEmployee" ADD CONSTRAINT "_BenefitToEmployee_A_fkey" FOREIGN KEY ("A") REFERENCES "Benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BenefitToEmployee" ADD CONSTRAINT "_BenefitToEmployee_B_fkey" FOREIGN KEY ("B") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BenefitToEmployeeGroup" ADD CONSTRAINT "_BenefitToEmployeeGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BenefitToEmployeeGroup" ADD CONSTRAINT "_BenefitToEmployeeGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "EmployeeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
