/*
  Warnings:

  - The primary key for the `ErrorReport` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ErrorReport" DROP CONSTRAINT "ErrorReport_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ErrorReport_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ErrorReport_id_seq";
