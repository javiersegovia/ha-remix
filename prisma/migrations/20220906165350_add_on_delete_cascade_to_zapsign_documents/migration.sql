-- DropForeignKey
ALTER TABLE "ZapsignDocument" DROP CONSTRAINT "ZapsignDocument_employeeId_fkey";

-- AddForeignKey
ALTER TABLE "ZapsignDocument" ADD CONSTRAINT "ZapsignDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
