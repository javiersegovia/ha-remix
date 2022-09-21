-- AlterTable
ALTER TABLE "PayrollAdvance" ADD COLUMN     "customRequestReason" TEXT;

-- CreateTable
CREATE TABLE "PayrollAdvanceRequestReason" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "payrollAdvanceId" INTEGER NOT NULL,

    CONSTRAINT "PayrollAdvanceRequestReason_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayrollAdvanceRequestReason_payrollAdvanceId_key" ON "PayrollAdvanceRequestReason"("payrollAdvanceId");

-- AddForeignKey
ALTER TABLE "PayrollAdvanceRequestReason" ADD CONSTRAINT "PayrollAdvanceRequestReason_payrollAdvanceId_fkey" FOREIGN KEY ("payrollAdvanceId") REFERENCES "PayrollAdvance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
