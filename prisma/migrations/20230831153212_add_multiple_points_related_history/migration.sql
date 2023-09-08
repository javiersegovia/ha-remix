/*
  Warnings:

  - You are about to drop the column `availablePoints` on the `CompanyPoints` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ChallengeHistoryType" AS ENUM ('CREATION', 'MODIFICATION', 'COMPLETION', 'EXPIRATION');

-- CreateEnum
CREATE TYPE "CompanyPointsHistoryType" AS ENUM ('BUDGET_MODIFICATION', 'REWARD_COMPLETION', 'POINT_CONSUMPTION');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PointTransactionType" ADD VALUE 'REWARD';
ALTER TYPE "PointTransactionType" ADD VALUE 'MODIFICATION';

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "reward" INTEGER,
ADD COLUMN     "rewardEligibles" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "status" "ChallengeStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "CompanyPoints" DROP COLUMN "availablePoints",
ADD COLUMN     "circulatingPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentBudget" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "estimatedBudget" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prepaidPoints" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ChallengeHistory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "ChallengeHistoryType" NOT NULL,
    "employeeId" TEXT,

    CONSTRAINT "ChallengeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPointsHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "CompanyPointsHistoryType" NOT NULL,

    CONSTRAINT "CompanyPointsHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChallengeHistory" ADD CONSTRAINT "ChallengeHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
