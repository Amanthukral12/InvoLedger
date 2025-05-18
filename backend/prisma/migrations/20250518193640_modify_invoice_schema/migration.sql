/*
  Warnings:

  - You are about to drop the column `cgst` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `cgstPercent` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `igst` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `igstPercent` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `sgst` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `sgstPercent` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `taxPercent` on the `Invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "cgst",
DROP COLUMN "cgstPercent",
DROP COLUMN "igst",
DROP COLUMN "igstPercent",
DROP COLUMN "sgst",
DROP COLUMN "sgstPercent",
DROP COLUMN "taxPercent",
ADD COLUMN     "totalCgst" DOUBLE PRECISION,
ADD COLUMN     "totalIgst" DOUBLE PRECISION,
ADD COLUMN     "totalSgst" DOUBLE PRECISION;
