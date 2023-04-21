-- CreateTable
CREATE TABLE "SalaryRange" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "minValue" INTEGER NOT NULL,
    "maxValue" INTEGER,

    CONSTRAINT "SalaryRange_pkey" PRIMARY KEY ("id")
);
