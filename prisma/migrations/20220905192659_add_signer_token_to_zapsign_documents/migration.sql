/*
  Warnings:

  - Added the required column `signerToken` to the `ZapsignDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ZapsignDocument" ADD COLUMN     "signerToken" TEXT NOT NULL;
