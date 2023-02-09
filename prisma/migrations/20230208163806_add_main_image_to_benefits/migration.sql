-- AlterTable
ALTER TABLE "Benefit" ADD COLUMN     "mainImageId" TEXT;

-- AddForeignKey
ALTER TABLE "Benefit" ADD CONSTRAINT "Benefit_mainImageId_fkey" FOREIGN KEY ("mainImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
