-- CreateEnum
CREATE TYPE "ZapsignDocumentStatus" AS ENUM ('PENDING', 'SIGNED');

-- CreateTable
CREATE TABLE "ZapsignDocument" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalToken" TEXT NOT NULL,
    "documentStatus" "ZapsignDocumentStatus" NOT NULL DEFAULT E'PENDING',
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "ZapsignDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ZapsignDocument" ADD CONSTRAINT "ZapsignDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
