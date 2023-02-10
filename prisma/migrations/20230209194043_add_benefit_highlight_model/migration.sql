-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "logoImageId" TEXT;

-- CreateTable
CREATE TABLE "BenefitHighlight" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "buttonHref" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "benefitId" INTEGER NOT NULL,

    CONSTRAINT "BenefitHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BenefitHighlight_benefitId_key" ON "BenefitHighlight"("benefitId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_logoImageId_fkey" FOREIGN KEY ("logoImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenefitHighlight" ADD CONSTRAINT "BenefitHighlight_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenefitHighlight" ADD CONSTRAINT "BenefitHighlight_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "Benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
