/*
  Warnings:

  - The values [MANAGE_BENEFIT_CATEGORY] on the enum `PermissionCode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PermissionCode_new" AS ENUM ('MANAGE_EMPLOYEE_GROUP', 'MANAGE_EMPLOYEE_MAIN_INFORMATION', 'MANAGE_EMPLOYEE_FINANCIAL_INFORMATION', 'MANAGE_COMPANY', 'MANAGE_BENEFIT', 'VIEW_INDICATOR_ACTIVITY', 'MANAGE_INDICATOR_ACTIVITY', 'TRANSFER_POINTS', 'MANAGE_COMPANY_POINTS');
ALTER TABLE "Permission" ALTER COLUMN "code" TYPE "PermissionCode_new" USING ("code"::text::"PermissionCode_new");
ALTER TYPE "PermissionCode" RENAME TO "PermissionCode_old";
ALTER TYPE "PermissionCode_new" RENAME TO "PermissionCode";
DROP TYPE "PermissionCode_old";
COMMIT;
