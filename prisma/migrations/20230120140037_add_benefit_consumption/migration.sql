-- CreateTable
CREATE TABLE "BenefitSubproduct" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "benefitId" INTEGER NOT NULL,

    CONSTRAINT "BenefitSubproduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenefitConsumption" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3) NOT NULL,
    "value" INTEGER NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "benefitSubproductId" INTEGER,
    "benefitId" INTEGER NOT NULL,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "BenefitConsumption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BenefitSubproduct" ADD CONSTRAINT "BenefitSubproduct_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "Benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenefitConsumption" ADD CONSTRAINT "BenefitConsumption_benefitSubproductId_fkey" FOREIGN KEY ("benefitSubproductId") REFERENCES "BenefitSubproduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenefitConsumption" ADD CONSTRAINT "BenefitConsumption_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "Benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenefitConsumption" ADD CONSTRAINT "BenefitConsumption_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
