-- DropForeignKey
ALTER TABLE "City" DROP CONSTRAINT "City_stateId_fkey";

-- AlterTable
ALTER TABLE "City" ALTER COLUMN "stateId" DROP NOT NULL,
ALTER COLUMN "stateId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;
