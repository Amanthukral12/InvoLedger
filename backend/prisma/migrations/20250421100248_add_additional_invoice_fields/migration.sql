-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "cgstPercent" DOUBLE PRECISION,
ADD COLUMN     "igstPercent" DOUBLE PRECISION,
ADD COLUMN     "sgstPercent" DOUBLE PRECISION,
ADD COLUMN     "taxPercent" DOUBLE PRECISION;
