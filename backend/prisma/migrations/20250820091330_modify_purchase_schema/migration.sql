/*
  Warnings:

  - Added the required column `unit` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseItem" ADD COLUMN     "unit" TEXT NOT NULL;
