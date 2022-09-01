-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "acceptedPrivacyPolicy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptedTermsOfService" BOOLEAN NOT NULL DEFAULT false;
