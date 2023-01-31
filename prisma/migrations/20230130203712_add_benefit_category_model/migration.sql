-- AlterTable
ALTER TABLE "Benefit" ADD COLUMN     "benefitCategoryId" INTEGER;

-- CreateTable
CREATE TABLE "BenefitCategory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BenefitCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Benefit" ADD CONSTRAINT "Benefit_benefitCategoryId_fkey" FOREIGN KEY ("benefitCategoryId") REFERENCES "BenefitCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
