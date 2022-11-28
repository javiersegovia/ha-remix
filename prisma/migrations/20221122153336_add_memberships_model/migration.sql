-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "membershipId" INTEGER;

-- CreateTable
CREATE TABLE "Membership" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BenefitToCompany" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BenefitToMembership" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BenefitToCompany_AB_unique" ON "_BenefitToCompany"("A", "B");

-- CreateIndex
CREATE INDEX "_BenefitToCompany_B_index" ON "_BenefitToCompany"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BenefitToMembership_AB_unique" ON "_BenefitToMembership"("A", "B");

-- CreateIndex
CREATE INDEX "_BenefitToMembership_B_index" ON "_BenefitToMembership"("B");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BenefitToCompany" ADD CONSTRAINT "_BenefitToCompany_A_fkey" FOREIGN KEY ("A") REFERENCES "Benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BenefitToCompany" ADD CONSTRAINT "_BenefitToCompany_B_fkey" FOREIGN KEY ("B") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BenefitToMembership" ADD CONSTRAINT "_BenefitToMembership_A_fkey" FOREIGN KEY ("A") REFERENCES "Benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BenefitToMembership" ADD CONSTRAINT "_BenefitToMembership_B_fkey" FOREIGN KEY ("B") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
