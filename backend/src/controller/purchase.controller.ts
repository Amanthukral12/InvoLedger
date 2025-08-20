import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../db/db";
import { ApiResponse } from "../utils/ApiResponse";
import { PurchaseItem } from "../types/types";

export const createPurchase = asyncHandler(
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
      amount,
      cartage,
      subTotal,
      totalAmount,
      totalCGST,
      totalIGST,
      totalSGST,
      totalGST,
      totalAmountInWords,
      purchaseItems,
    } = req.body;

    const purchase = await prisma.$transaction(async (prisma) => {
      const newPurchase = await prisma.purchase.create({
        data: {
          companyId,
          invoiceNumber,
          invoiceDate,
          clientId,
          amount,
          cartage,
          subTotal,
          totalAmountInWords,
          totalAmount,
          totalCGST,
          totalIGST,
          totalSGST,
          totalGST,
          purchaseItems: {
            create: purchaseItems.map((item: PurchaseItem) => ({
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
              unit: item.unit,
            })),
          },
        },
        include: {
          purchaseItems: true,
          client: true,
          company: true,
        },
      });
      return newPurchase;
    });
    return res
      .status(201)
      .json(new ApiResponse(201, purchase, "Purchase created successfully"));
  }
);

export const deletePurchase = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const purchaseId = req.params.id;

    const purchaseExists = await prisma.purchase.findFirst({
      where: { id: purchaseId, companyId },
    });

    if (!purchaseExists) {
      throw new ApiError(404, "Purchase not found", ["Purchase not found"]);
    }

    await prisma.purchase.delete({
      where: { id: purchaseExists.id, companyId: purchaseExists.companyId },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Purchase deleted successfully"));
  }
);

export const updatePurchase = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }

    const companyId = req.company.id;
    const purchaseId = req.params.id;
    const {
      invoiceNumber,
      invoiceDate,
      clientId,
      amount,
      cartage,
      subTotal,
      totalAmount,
      totalCGST,
      totalIGST,
      totalSGST,
      totalGST,
      totalAmountInWords,
      purchaseItems,
    } = req.body;

    const purchaseExists = await prisma.purchase.findFirst({
      where: { id: purchaseId, companyId },
    });

    if (!purchaseExists) {
      throw new ApiError(404, "Purchase not found", ["Purchase not found"]);
    }

    const updatedPurchase = await prisma.purchase.update({
      where: { id: purchaseExists.id },
      data: {
        invoiceNumber: invoiceNumber !== undefined ? invoiceNumber : undefined,
        invoiceDate: invoiceDate !== undefined ? invoiceDate : undefined,
        clientId: clientId !== undefined ? clientId : undefined,
        subTotal: subTotal !== undefined ? subTotal : undefined,
        amount: amount !== undefined ? amount : undefined,
        cartage: cartage !== undefined ? cartage : undefined,
        totalAmount: totalAmount !== undefined ? totalAmount : undefined,
        totalCGST: totalCGST !== undefined ? totalCGST : undefined,
        totalIGST: totalIGST !== undefined ? totalIGST : undefined,
        totalSGST: totalSGST !== undefined ? totalSGST : undefined,
        totalGST: totalGST !== undefined ? totalGST : undefined,
        totalAmountInWords:
          totalAmountInWords !== undefined ? totalAmountInWords : undefined,
        purchaseItems:
          purchaseItems !== undefined
            ? {
                deleteMany: {},
                create: purchaseItems.map((item: PurchaseItem) => ({
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
                  unit: item.unit,
                })),
              }
            : undefined,
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedPurchase, "Purchase updated successfully")
      );
  }
);

export const getAllPurchasesForMonthForCompany = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const { month = currentMonth, year = currentYear } = req.query;

    console.log(month, year);

    let where: any = {
      companyId: Number(companyId),
    };

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);
      where = {
        ...where,
        invoiceDate: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const purchases = await prisma.purchase.findMany({
      where,
      select: {
        invoiceNumber: true,
        invoiceDate: true,
        amount: true,
        cartage: true,
        totalAmount: true,
        totalCGST: true,
        totalIGST: true,
        totalSGST: true,
        totalGST: true,
        client: {
          select: {
            name: true,
            GSTIN: true,
          },
        },
        purchaseItems: true,
      },
      orderBy: {
        invoiceDate: "asc",
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, purchases, "Purchases retrieved successfully")
      );
  }
);

export const getPurchaseById = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }

    const companyId = req.company.id;
    const purchaseId = req.params.id;

    const purchase = await prisma.purchase.findFirst({
      where: { id: purchaseId, companyId },
      include: {
        purchaseItems: true,
      },
    });

    if (!purchase) {
      throw new ApiError(404, "Purchase not found", ["Purchase not found"]);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, purchase, "Purchase retrieved successfully"));
  }
);

export const getAllPurchasesForCompany = asyncHandler(
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
      searchTerm,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let where: any = {
      companyId,
    };

    if (searchTerm) {
      const term = String(searchTerm).toLowerCase();
      where = {
        ...where,
        OR: [
          {
            invoiceNumber: {
              contains: term,
              mode: "insensitive",
            },
          },
          {
            client: {
              name: {
                contains: term,
                mode: "insensitive",
              },
            },
          },
        ],
      };
    } else if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 1);
      where = {
        ...where,
        invoiceDate: {
          gte: startDate,
          lt: endDate,
        },
      };
    }

    const [totalCount, purchases] = await Promise.all([
      prisma.purchase.count({ where }),
      prisma.purchase.findMany({
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
          purchases,
          totalCount,
          currentPage: Number(page),
          pageSize: Number(limit),
        },
        "Purchases fetched successfully"
      )
    );
  }
);

export const getPurchasesSummary = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const { month = currentMonth, year = currentYear } = req.query;

    let where: any = {
      companyId: Number(companyId),
    };

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 1);

      where = {
        ...where,
        invoiceDate: {
          gte: startDate,
          lt: endDate,
        },
      };
    }

    const total = await prisma.purchase.aggregate({
      _sum: {
        totalAmount: true,
        totalCGST: true,
        totalSGST: true,
        totalIGST: true,
      },
      where,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          total,
        },
        "Purchases Summary fetched successfully"
      )
    );
  }
);
