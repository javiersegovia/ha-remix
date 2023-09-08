/*
  Warnings:

  - You are about to drop the `CompanyPointsHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ApplicationFeatures" AS ENUM ('BENEFITS_FEATURE', 'CHALLENGES_FEATURE');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "applicationFeatures" "ApplicationFeatures"[] DEFAULT ARRAY['CHALLENGES_FEATURE']::"ApplicationFeatures"[];

-- DropTable
DROP TABLE "CompanyPointsHistory";

-- DropEnum
DROP TYPE "CompanyPointsHistoryType";
