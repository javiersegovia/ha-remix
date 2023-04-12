-- DropForeignKey
ALTER TABLE "CompanyBenefit" DROP CONSTRAINT "CompanyBenefit_benefitId_fkey";

-- AddForeignKey
ALTER TABLE "CompanyBenefit" ADD CONSTRAINT "CompanyBenefit_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "Benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
