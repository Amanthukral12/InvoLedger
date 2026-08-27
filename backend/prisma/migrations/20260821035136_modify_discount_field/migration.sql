/*
  Warnings:

  - You are about to drop the column `discount` on the `Invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "discount",
ADD COLUMN     "discountAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "discountPercent" DOUBLE PRECISION DEFAULT 0;
