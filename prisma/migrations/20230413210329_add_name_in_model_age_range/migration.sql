/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `AgeRange` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `AgeRange` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AgeRange" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AgeRange_name_key" ON "AgeRange"("name");
