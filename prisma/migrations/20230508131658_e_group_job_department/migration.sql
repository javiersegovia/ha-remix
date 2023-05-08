-- AlterTable
ALTER TABLE "EmployeeGroup" ADD COLUMN     "jobDepartmentId" INTEGER;

-- AddForeignKey
ALTER TABLE "EmployeeGroup" ADD CONSTRAINT "EmployeeGroup_jobDepartmentId_fkey" FOREIGN KEY ("jobDepartmentId") REFERENCES "JobDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
