import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import prisma from "../db/db";
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
          company: true,
        },
      });
      return newInvoice;
    });
    return res
      .status(201)
      .json(new ApiResponse(201, invoice, "Invoice added successfully"));
  }
);

export const deleteInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const invoiceId = req.params.id;

    const invoiceExists = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        companyId: Number(companyId),
      },
    });

    if (!invoiceExists) {
      throw new ApiError(404, "Invoice not found", [
        "Unauthorized Access. Please login again",
      ]);
    }

    await prisma.invoice.delete({
      where: {
        id: invoiceExists.id,
        companyId: invoiceExists.companyId,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Invoice delete successfully"));
  }
);

export const getInvoiceById = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const invoiceId = req.params.id;

    const invoiceExists = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        companyId: Number(companyId),
      },
    });

    if (!invoiceExists) {
      throw new ApiError(404, "Invoice not found", [
        "Unauthorized Access. Please login again",
      ]);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, invoiceExists, "Invoice fetched successfully")
      );
  }
);

export const updateInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const invoiceId = req.params.id;

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

    const invoiceExists = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        companyId: Number(companyId),
      },
    });

    if (!invoiceExists) {
      throw new ApiError(404, "Invoice not found", [
        "Unauthorized Access. Please login again",
      ]);
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceExists.id, companyId: invoiceExists.companyId },
      data: {
        invoiceNumber: invoiceNumber !== undefined ? invoiceNumber : undefined,
        invoiceDate: invoiceDate !== undefined ? invoiceDate : undefined,
        clientId: clientId !== undefined ? clientId : undefined,
        shipToPartyId: shipToPartyId !== undefined ? shipToPartyId : undefined,
        amount: amount !== undefined ? amount : undefined,
        cartage: cartage !== undefined ? cartage : undefined,
        subTotal: subTotal !== undefined ? subTotal : undefined,
        sgst: sgst !== undefined ? sgst : undefined,
        cgst: cgst !== undefined ? cgst : undefined,
        igst: igst !== undefined ? igst : undefined,
        totalAmount: totalAmount !== undefined ? totalAmount : undefined,
        totalAmountInWords:
          totalAmountInWords !== undefined ? totalAmountInWords : undefined,
        reverseCharge: reverseCharge !== undefined ? reverseCharge : undefined,
        transportMode: transportMode !== undefined ? transportMode : undefined,
        vehicleNumber: vehicleNumber !== undefined ? vehicleNumber : undefined,
        placeOfSupply: placeOfSupply !== undefined ? placeOfSupply : undefined,
        invoiceItems:
          invoiceItems !== undefined
            ? {
                deleteMany: {},
                create: invoiceItems.map((item: InvoiceItem) => ({
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  hsnCode: item.hsnCode,
                  amount: item.amount,
                })),
              }
            : undefined,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, updatedInvoice, "Invoice updated successfully")
      );
  }
);

export const generateInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const invoiceId = req.params.id;
    const invoiceExists = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        companyId: Number(companyId),
      },
    });

    if (!invoiceExists) {
      throw new ApiError(404, "Invoice not found", [
        "Unauthorized Access. Please login again",
      ]);
    }
  }
);
