-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" INTEGER NOT NULL,
    "clientId" TEXT NOT NULL,
    "shipToPartyId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "cartage" DOUBLE PRECISION,
    "subTotal" DOUBLE PRECISION NOT NULL,
    "sgst" DOUBLE PRECISION,
    "cgst" DOUBLE PRECISION,
    "igst" DOUBLE PRECISION,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "totalAmountInWords" TEXT NOT NULL,
    "reverseCharge" BOOLEAN NOT NULL DEFAULT false,
    "transportMode" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "placeOfSupply" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipToParty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "GSTIN" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipToParty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShipToParty_GSTIN_key" ON "ShipToParty"("GSTIN");

-- CreateIndex
CREATE UNIQUE INDEX "ShipToParty_GSTIN_id_key" ON "ShipToParty"("GSTIN", "id");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_shipToPartyId_fkey" FOREIGN KEY ("shipToPartyId") REFERENCES "ShipToParty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
