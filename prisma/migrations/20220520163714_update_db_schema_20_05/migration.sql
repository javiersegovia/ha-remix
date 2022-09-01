-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('MEMBER', 'MANAGER', 'OWNER');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "PayrollAdvanceStatus" AS ENUM ('REQUESTED', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollAdvancePaymentMethod" AS ENUM ('WALLET', 'BANK_ACCOUNT');

-- CreateEnum
CREATE TYPE "PayrollAdvanceTransferStatus" AS ENUM ('PENDING', 'FAILURE', 'SUCCESS');

-- CreateEnum
CREATE TYPE "PayrollAdvanceHistoryActor" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "verifiedEmail" BOOLEAN NOT NULL DEFAULT false,
    "loginToken" TEXT,
    "loginExpiration" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CompanyStatus" NOT NULL DEFAULT E'INACTIVE',
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "lastRequestDay" INTEGER NOT NULL DEFAULT 25,
    "countryId" INTEGER,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyDebt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "CompanyDebt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyFiatDebt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL,
    "currencyId" INTEGER NOT NULL,
    "companyDebtId" TEXT,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "CompanyFiatDebt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCryptoDebt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL,
    "cryptocurrencyId" INTEGER NOT NULL,
    "companyDebtId" TEXT,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "CompanyCryptoDebt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyContactPerson" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "CompanyContactPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCategory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CompanyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT E'INACTIVE',
    "roles" "EmployeeRole"[],
    "salary" DOUBLE PRECISION,
    "salaryFiat" DOUBLE PRECISION,
    "advanceMaxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advanceAvailableAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currencyId" INTEGER,
    "salaryCrypto" DOUBLE PRECISION,
    "advanceCryptoMaxAmount" DOUBLE PRECISION DEFAULT 0,
    "advanceCryptoAvailableAmount" DOUBLE PRECISION DEFAULT 0,
    "cryptocurrencyId" INTEGER,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankAccountId" TEXT,
    "walletId" TEXT,
    "jobDepartmentId" INTEGER,
    "jobPositionId" INTEGER,
    "countryId" INTEGER,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code2" TEXT NOT NULL,
    "phoneCode" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDepartment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "JobDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosition" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "JobPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyTax" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "valueType" "TaxType" NOT NULL DEFAULT E'PERCENTAGE',
    "value" DOUBLE PRECISION NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "CompanyTax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalTax" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "valueType" "TaxType" NOT NULL DEFAULT E'PERCENTAGE',
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GlobalTax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bank" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" INTEGER,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankFee" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "valueType" "TaxType" NOT NULL DEFAULT E'FIXED',
    "value" DOUBLE PRECISION NOT NULL,
    "bankId" INTEGER NOT NULL,

    CONSTRAINT "BankFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountTypeId" INTEGER NOT NULL,
    "bankId" INTEGER NOT NULL,
    "identityDocumentId" INTEGER NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccountType" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BankAccountType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityDocument" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "value" TEXT NOT NULL,
    "documentTypeId" INTEGER NOT NULL,

    CONSTRAINT "IdentityDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityDocumentType" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "IdentityDocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "countryId" INTEGER,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cryptocurrency" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,

    CONSTRAINT "Cryptocurrency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "networkId" INTEGER,
    "cryptocurrencyId" INTEGER,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoNetwork" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "networkIdNumber" INTEGER NOT NULL,

    CONSTRAINT "CryptoNetwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollAdvance" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requestedAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "PayrollAdvanceStatus" NOT NULL DEFAULT E'REQUESTED',
    "paymentMethod" "PayrollAdvancePaymentMethod" NOT NULL,
    "employeeId" TEXT,
    "companyId" TEXT NOT NULL,
    "companyCryptoDebtId" TEXT,
    "companyFiatDebtId" TEXT,

    CONSTRAINT "PayrollAdvance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollAdvanceHistory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "toStatus" "PayrollAdvanceStatus" NOT NULL,
    "actor" "PayrollAdvanceHistoryActor" NOT NULL,
    "payrollAdvanceId" INTEGER NOT NULL,
    "employeeId" TEXT,
    "adminUserId" TEXT,

    CONSTRAINT "PayrollAdvanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollAdvanceTransfer" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "status" "PayrollAdvanceTransferStatus" NOT NULL,
    "payrollAdvanceId" INTEGER NOT NULL,
    "adminUserId" TEXT NOT NULL,

    CONSTRAINT "PayrollAdvanceTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollAdvanceTax" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "payrollAdvanceId" INTEGER NOT NULL,

    CONSTRAINT "PayrollAdvanceTax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollAdvanceBankAccount" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "currencyName" TEXT,
    "bankName" TEXT NOT NULL,
    "bankFeeName" TEXT,
    "bankFeeValue" DOUBLE PRECISION,
    "bankFeeValueType" TEXT,
    "identityDocumentValue" TEXT NOT NULL,
    "identityDocumentType" TEXT NOT NULL,
    "payrollAdvanceId" INTEGER NOT NULL,

    CONSTRAINT "PayrollAdvanceBankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollAdvanceWallet" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "cryptocurrencyName" TEXT NOT NULL,
    "cryptocurrencyAcronym" TEXT NOT NULL,
    "cryptoNetworkName" TEXT NOT NULL,
    "cryptoNetworkIdNumber" INTEGER NOT NULL,
    "payrollAdvanceId" INTEGER NOT NULL,

    CONSTRAINT "PayrollAdvanceWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompanyToCompanyCategory" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CompanyToCryptocurrency" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CompanyTaxToEmployee" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BankToCompany" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_loginToken_key" ON "User"("loginToken");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyFiatDebt_companyDebtId_key" ON "CompanyFiatDebt"("companyDebtId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCryptoDebt_companyDebtId_key" ON "CompanyCryptoDebt"("companyDebtId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyContactPerson_companyId_key" ON "CompanyContactPerson"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCategory_name_key" ON "CompanyCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_bankAccountId_key" ON "Employee"("bankAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_walletId_key" ON "Employee"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code2_key" ON "Country"("code2");

-- CreateIndex
CREATE UNIQUE INDEX "JobDepartment_name_key" ON "JobDepartment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "JobPosition_name_key" ON "JobPosition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalTax_name_key" ON "GlobalTax"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BankFee_bankId_key" ON "BankFee"("bankId");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_identityDocumentId_key" ON "BankAccount"("identityDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccountType_name_key" ON "BankAccountType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityDocumentType_name_key" ON "IdentityDocumentType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_name_key" ON "Currency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Cryptocurrency_name_key" ON "Cryptocurrency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoNetwork_name_key" ON "CryptoNetwork"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollAdvanceTransfer_transactionHash_key" ON "PayrollAdvanceTransfer"("transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollAdvanceBankAccount_payrollAdvanceId_key" ON "PayrollAdvanceBankAccount"("payrollAdvanceId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollAdvanceWallet_payrollAdvanceId_key" ON "PayrollAdvanceWallet"("payrollAdvanceId");

-- CreateIndex
CREATE UNIQUE INDEX "_CompanyToCompanyCategory_AB_unique" ON "_CompanyToCompanyCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_CompanyToCompanyCategory_B_index" ON "_CompanyToCompanyCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CompanyToCryptocurrency_AB_unique" ON "_CompanyToCryptocurrency"("A", "B");

-- CreateIndex
CREATE INDEX "_CompanyToCryptocurrency_B_index" ON "_CompanyToCryptocurrency"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CompanyTaxToEmployee_AB_unique" ON "_CompanyTaxToEmployee"("A", "B");

-- CreateIndex
CREATE INDEX "_CompanyTaxToEmployee_B_index" ON "_CompanyTaxToEmployee"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BankToCompany_AB_unique" ON "_BankToCompany"("A", "B");

-- CreateIndex
CREATE INDEX "_BankToCompany_B_index" ON "_BankToCompany"("B");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyDebt" ADD CONSTRAINT "CompanyDebt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFiatDebt" ADD CONSTRAINT "CompanyFiatDebt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFiatDebt" ADD CONSTRAINT "CompanyFiatDebt_companyDebtId_fkey" FOREIGN KEY ("companyDebtId") REFERENCES "CompanyDebt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFiatDebt" ADD CONSTRAINT "CompanyFiatDebt_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCryptoDebt" ADD CONSTRAINT "CompanyCryptoDebt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCryptoDebt" ADD CONSTRAINT "CompanyCryptoDebt_companyDebtId_fkey" FOREIGN KEY ("companyDebtId") REFERENCES "CompanyDebt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCryptoDebt" ADD CONSTRAINT "CompanyCryptoDebt_cryptocurrencyId_fkey" FOREIGN KEY ("cryptocurrencyId") REFERENCES "Cryptocurrency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContactPerson" ADD CONSTRAINT "CompanyContactPerson_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_jobDepartmentId_fkey" FOREIGN KEY ("jobDepartmentId") REFERENCES "JobDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_jobPositionId_fkey" FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_cryptocurrencyId_fkey" FOREIGN KEY ("cryptocurrencyId") REFERENCES "Cryptocurrency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyTax" ADD CONSTRAINT "CompanyTax_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankFee" ADD CONSTRAINT "BankFee_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_accountTypeId_fkey" FOREIGN KEY ("accountTypeId") REFERENCES "BankAccountType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_identityDocumentId_fkey" FOREIGN KEY ("identityDocumentId") REFERENCES "IdentityDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityDocument" ADD CONSTRAINT "IdentityDocument_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "IdentityDocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_cryptocurrencyId_fkey" FOREIGN KEY ("cryptocurrencyId") REFERENCES "Cryptocurrency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "CryptoNetwork"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAdvance" ADD CONSTRAINT "PayrollAdvance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAdvance" ADD CONSTRAINT "PayrollAdvance_companyFiatDebtId_fkey" FOREIGN KEY ("companyFiatDebtId") REFERENCES "CompanyFiatDebt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAdvance" ADD CONSTRAINT "PayrollAdvance_companyCryptoDebtId_fkey" FOREIGN KEY ("companyCryptoDebtId") REFERENCES "CompanyCryptoDebt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAdvance" ADD CONSTRAINT "PayrollAdvance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAdvanceHistory" ADD CONSTRAINT "PayrollAdvanceHistory_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAdvanceHistory" ADD CONSTRAINT "PayrollAdvanceHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAdvanceHistory" ADD CONSTRAINT "PayrollAdvanceHistory_payrollAdvanceId_fkey" FOREIGN KEY ("payrollAdvanceId") REFERENCES "PayrollAdvance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAdvanceTransfer" ADD CONSTRAINT "PayrollAdvanceTransfer_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAdvanceTransfer" ADD CONSTRAINT "PayrollAdvanceTransfer_payrollAdvanceId_fkey" FOREIGN KEY ("payrollAdvanceId") REFERENCES "PayrollAdvance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAdvanceTax" ADD CONSTRAINT "PayrollAdvanceTax_payrollAdvanceId_fkey" FOREIGN KEY ("payrollAdvanceId") REFERENCES "PayrollAdvance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAdvanceBankAccount" ADD CONSTRAINT "PayrollAdvanceBankAccount_payrollAdvanceId_fkey" FOREIGN KEY ("payrollAdvanceId") REFERENCES "PayrollAdvance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAdvanceWallet" ADD CONSTRAINT "PayrollAdvanceWallet_payrollAdvanceId_fkey" FOREIGN KEY ("payrollAdvanceId") REFERENCES "PayrollAdvance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyToCompanyCategory" ADD FOREIGN KEY ("A") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyToCompanyCategory" ADD FOREIGN KEY ("B") REFERENCES "CompanyCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyToCryptocurrency" ADD FOREIGN KEY ("A") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyToCryptocurrency" ADD FOREIGN KEY ("B") REFERENCES "Cryptocurrency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyTaxToEmployee" ADD FOREIGN KEY ("A") REFERENCES "CompanyTax"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyTaxToEmployee" ADD FOREIGN KEY ("B") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BankToCompany" ADD FOREIGN KEY ("A") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BankToCompany" ADD FOREIGN KEY ("B") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
