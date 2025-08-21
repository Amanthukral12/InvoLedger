/*
  Warnings:

  - You are about to drop the column `hsnCode` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `item` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `taxPercent` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `Purchase` table. All the data in the column will be lost.
  - Added the required column `subTotal` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmountInWords` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "hsnCode",
DROP COLUMN "item",
DROP COLUMN "quantity",
DROP COLUMN "taxPercent",
DROP COLUMN "unitPrice",
ADD COLUMN     "subTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalAmountInWords" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "hsnCode" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "taxPercent" DOUBLE PRECISION,
    "sgstPercent" DOUBLE PRECISION,
    "cgstPercent" DOUBLE PRECISION,
    "igstPercent" DOUBLE PRECISION,
    "sgst" DOUBLE PRECISION,
    "cgst" DOUBLE PRECISION,
    "igst" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
