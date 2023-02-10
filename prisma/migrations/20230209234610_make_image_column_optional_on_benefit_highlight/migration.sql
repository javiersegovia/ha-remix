-- DropForeignKey
ALTER TABLE "BenefitHighlight" DROP CONSTRAINT "BenefitHighlight_imageId_fkey";

-- AlterTable
ALTER TABLE "BenefitHighlight" ALTER COLUMN "imageId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BenefitHighlight" ADD CONSTRAINT "BenefitHighlight_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
