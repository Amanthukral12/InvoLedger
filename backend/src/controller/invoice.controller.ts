import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import prisma from "../db/db";
import { InvoiceItem } from "../types/types";
import { ApiResponse } from "../utils/ApiResponse";
import { generateInvoicePdf } from "../utils/invoice";

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
      totalAmount,
      totalAmountInWords,
      reverseCharge,
      transportMode,
      vehicleNumber,
      placeOfSupply,
      invoiceItems,
    } = req.body;

    const cleanedShipToPartyId = shipToPartyId === "" ? null : shipToPartyId;

    const invoice = await prisma.$transaction(async (prisma) => {
      const newInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          invoiceDate,
          companyId,
          clientId,
          shipToPartyId: cleanedShipToPartyId,
          amount,
          cartage,
          subTotal,
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
              sgst: item.sgst,
              cgst: item.cgst,
              igst: item.igst,
              sgstPercent: item.sgstPercent,
              cgstPercent: item.cgstPercent,
              igstPercent: item.igstPercent,
              taxPercent: item.taxPercent,
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
        "Invoice not found. Please try again.",
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
      include: {
        invoiceItems: true,
      },
    });

    if (!invoiceExists) {
      throw new ApiError(404, "Invoice not found", [
        "Invoice not found. Please try again.",
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
        "Invoice not found. Please try again.",
      ]);
    }

    const cleanedShipToPartyId = shipToPartyId === "" ? null : shipToPartyId;

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceExists.id, companyId: invoiceExists.companyId },
      data: {
        invoiceNumber: invoiceNumber !== undefined ? invoiceNumber : undefined,
        invoiceDate: invoiceDate !== undefined ? invoiceDate : undefined,
        clientId: clientId !== undefined ? clientId : undefined,
        shipToPartyId:
          shipToPartyId !== undefined ? cleanedShipToPartyId : undefined,
        amount: amount !== undefined ? amount : undefined,
        cartage: cartage !== undefined ? cartage : undefined,
        subTotal: subTotal !== undefined ? subTotal : undefined,
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
                  taxPercent: item.taxPercent,
                  sgstPercent: item.sgstPercent,
                  cgstPercent: item.cgstPercent,
                  igstPercent: item.igstPercent,
                  sgst: item.sgst,
                  cgst: item.cgst,
                  igst: item.igst,
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
    const copyName = req.body.invoiceType;
    const invoiceExists = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        companyId: Number(companyId),
      },
      include: {
        invoiceItems: true,
        client: true,
        shipToParty: true,
        company: true,
      },
    });

    if (!invoiceExists) {
      throw new ApiError(404, "Invoice not found", [
        "Invoice not found. Please try again.",
      ]);
    }
    generateInvoicePdf(invoiceExists, copyName, res);
  }
);

export const getAllInvoicesForCompany = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const {
      page = 1,
      limit = 6,
      month = currentMonth,
      year = currentYear,
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let dateFilter = {};

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 1);
      dateFilter = {
        invoiceDate: {
          gte: startDate,
          lt: endDate,
        },
      };
    }

    const where = {
      companyId,
      ...dateFilter,
    };

    const [totalCount, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        select: {
          invoiceNumber: true,
          invoiceDate: true,
          id: true,
          client: {
            select: {
              name: true,
            },
          },
        },
        skip: Number(offset),
        take: Number(limit),
        orderBy: {
          invoiceDate: "desc",
        },
      }),
    ]);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          invoices,
          totalCount,
          currentPage: Number(page),
          pageSize: Number(limit),
        },
        "Invoices fetched successfully"
      )
    );
  }
);

export const getInvoiceCount = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;

    const year = req.query.year || new Date().getFullYear();

    type MonthlyInvoiceCount = {
      monthName: string;
      count: number;
    };

    const result = await prisma.$queryRaw<MonthlyInvoiceCount[]>`
      SELECT 
      to_char(DATE_TRUNC('month', "invoiceDate"), 'FMMonth') AS "monthName",
      COUNT(*)::int as count
      from "Invoice"
      where "companyId" = ${Number(companyId)} and EXTRACT(YEAR from "invoiceDate") = ${Number(year)}
      GROUP BY DATE_TRUNC('month', "invoiceDate")
      ORDER BY DATE_TRUNC('month', "invoiceDate")
    `;
    const allMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthlyCount = allMonths.map((monthName) => {
      const entry = result.find(
        (r) => r.monthName.toLowerCase() === monthName.toLowerCase()
      );
      return {
        monthName: monthName,
        count: entry ? entry.count : 0,
      };
    });
    const totalCount = await prisma.invoice.count({
      where: {
        companyId: Number(companyId),
        invoiceDate: {
          gte: new Date(Number(year), 0, 1),
          lte: new Date(Number(year), 11, 31),
        },
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          monthlyCount,
          totalCount,
        },
        "Invoices count fetched successfully"
      )
    );
  }
);
