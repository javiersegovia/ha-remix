/*
  Warnings:

  - You are about to drop the column `discount` on the `BenefitConsumption` table. All the data in the column will be lost.
  - Added the required column `discount` to the `BenefitSubproduct` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BenefitConsumption" DROP CONSTRAINT "BenefitConsumption_benefitSubproductId_fkey";

-- AlterTable
ALTER TABLE "BenefitConsumption" DROP COLUMN "discount";

-- AlterTable
ALTER TABLE "BenefitSubproduct" ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "BenefitConsumption" ADD CONSTRAINT "BenefitConsumption_benefitSubproductId_fkey" FOREIGN KEY ("benefitSubproductId") REFERENCES "BenefitSubproduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
