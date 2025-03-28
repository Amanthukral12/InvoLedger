/*
  Warnings:

  - A unique constraint covering the columns `[companyId,invoiceNumber]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[GSTIN,companyId]` on the table `ShipToParty` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `ShipToParty` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ShipToParty_GSTIN_id_key";

-- AlterTable
ALTER TABLE "ShipToParty" ADD COLUMN     "companyId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_companyId_invoiceNumber_key" ON "Invoice"("companyId", "invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ShipToParty_GSTIN_companyId_key" ON "ShipToParty"("GSTIN", "companyId");

-- AddForeignKey
ALTER TABLE "ShipToParty" ADD CONSTRAINT "ShipToParty_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
