-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "ewayBill" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ewayBillNumber" TEXT;
