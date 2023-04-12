-- CreateTable
CREATE TABLE "CompanyBenefit" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "benefitId" INTEGER NOT NULL,

    CONSTRAINT "CompanyBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyBenefitCategory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "benefitCategoryId" INTEGER NOT NULL,

    CONSTRAINT "CompanyBenefitCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyBenefit_benefitId_key" ON "CompanyBenefit"("benefitId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyBenefitCategory_benefitCategoryId_key" ON "CompanyBenefitCategory"("benefitCategoryId");

-- AddForeignKey
ALTER TABLE "CompanyBenefit" ADD CONSTRAINT "CompanyBenefit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyBenefit" ADD CONSTRAINT "CompanyBenefit_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "Benefit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyBenefitCategory" ADD CONSTRAINT "CompanyBenefitCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyBenefitCategory" ADD CONSTRAINT "CompanyBenefitCategory_benefitCategoryId_fkey" FOREIGN KEY ("benefitCategoryId") REFERENCES "BenefitCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
