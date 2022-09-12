/*
  Warnings:

  - The values [PENDING,SIGNED] on the enum `ZapsignDocumentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ZapsignDocumentStatus_new" AS ENUM ('pending', 'signed');
ALTER TABLE "ZapsignDocument" ALTER COLUMN "documentStatus" DROP DEFAULT;
ALTER TABLE "ZapsignDocument" ALTER COLUMN "documentStatus" TYPE "ZapsignDocumentStatus_new" USING ("documentStatus"::text::"ZapsignDocumentStatus_new");
ALTER TYPE "ZapsignDocumentStatus" RENAME TO "ZapsignDocumentStatus_old";
ALTER TYPE "ZapsignDocumentStatus_new" RENAME TO "ZapsignDocumentStatus";
DROP TYPE "ZapsignDocumentStatus_old";
ALTER TABLE "ZapsignDocument" ALTER COLUMN "documentStatus" SET DEFAULT 'pending';
COMMIT;

-- AlterTable
ALTER TABLE "ZapsignDocument" ALTER COLUMN "documentStatus" SET DEFAULT E'pending';
