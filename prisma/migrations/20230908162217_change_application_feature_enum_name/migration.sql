/*
  Warnings:

  - The `applicationFeatures` column on the `Company` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ApplicationFeature" AS ENUM ('BENEFITS_FEATURE', 'CHALLENGES_FEATURE');

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "applicationFeatures",
ADD COLUMN     "applicationFeatures" "ApplicationFeature"[] DEFAULT ARRAY['CHALLENGES_FEATURE']::"ApplicationFeature"[];

-- DropEnum
DROP TYPE "ApplicationFeatures";
