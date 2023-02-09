-- DropForeignKey
ALTER TABLE "CompanyCryptoDebt" DROP CONSTRAINT "CompanyCryptoDebt_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyDebt" DROP CONSTRAINT "CompanyDebt_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyFiatDebt" DROP CONSTRAINT "CompanyFiatDebt_companyId_fkey";

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_key_key" ON "Image"("key");

-- AddForeignKey
ALTER TABLE "CompanyDebt" ADD CONSTRAINT "CompanyDebt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFiatDebt" ADD CONSTRAINT "CompanyFiatDebt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCryptoDebt" ADD CONSTRAINT "CompanyCryptoDebt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
