import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import prisma from "../db/db";
import { formatDate } from "date-fns";
import { InvoiceItem } from "../types/types";
import { ApiResponse } from "../utils/ApiResponse";

export const createInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const {
      invoiceNumber,
      invoiceDate,
      clientId,
      shipToPartyId,
      amount,
      cartage,
      subTotal,
      sgst,
      cgst,
      igst,
      totalAmount,
      totalAmountInWords,
      reverseCharge,
      transportMode,
      vehicleNumber,
      placeOfSupply,
      invoiceItems,
    } = req.body;

    const invoice = await prisma.$transaction(async (prisma) => {
      const newInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          invoiceDate,
          companyId,
          clientId,
          shipToPartyId,
          amount,
          cartage,
          subTotal,
          sgst,
          cgst,
          igst,
          totalAmount,
          totalAmountInWords,
          reverseCharge,
          transportMode,
          vehicleNumber,
          placeOfSupply,
          invoiceItems: {
            create: invoiceItems.map((item: InvoiceItem) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              hsnCode: item.hsnCode,
              amount: item.amount,
            })),
          },
        },
        include: {
          invoiceItems: true,
          client: true,
          shipToParty: true,
        },
      });
      return newInvoice;
    });
    return res
      .status(201)
      .json(new ApiResponse(201, invoice, "Invoice added successfully"));
  }
);
