import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import prisma from "../db/db";
import { ApiResponse } from "../utils/ApiResponse";

export const createTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const clientIdFromParams = req.params.clientId;

    const { amount, type, date, description, bankName, clientIdFromBody } =
      req.body;

    const clientId = clientIdFromBody || clientIdFromParams;

    if (!clientId || !amount || !type || !date) {
      throw new ApiError(400, "Please fill all the fields", [
        "Please fill all the fields",
      ]);
    }

    const cleanedDescription = description !== null ? description : "";

    const transaction = await prisma.$transaction(async (prisma) => {
      const newTransaction = await prisma.transaction.create({
        data: {
          companyId,
          clientId,
          amount,
          bankName,
          type,
          date,
          description: cleanedDescription,
        },
      });

      const balanceChange = type === "DEBIT" ? amount : -amount;

      await prisma.client.update({
        where: { id: clientId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });
      return newTransaction;
    });
    return res
      .status(201)
      .json(
        new ApiResponse(201, transaction, "Transaction created successfully")
      );
  }
);

export const deleteTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const transactionId = req.params.id;
    const clientId = req.params.clientId;

    const transactionExists = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
        clientId: clientId,
        companyId: Number(companyId),
      },
    });

    if (!transactionExists) {
      throw new ApiError(404, "Transaction not found", [
        "Transaction not found",
      ]);
    }

    await prisma.$transaction(async (prisma) => {
      const deletedTransaction = await prisma.transaction.delete({
        where: {
          id: transactionExists.id,
        },
      });
      const balanceChange =
        transactionExists.type === "DEBIT"
          ? -transactionExists.amount
          : transactionExists.amount;

      await prisma.client.update({
        where: { id: clientId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });
      return deletedTransaction;
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Transaction deleted successfully"));
  }
);

export const getAllTransactionsForClient = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const currentYear = new Date().getFullYear();
    const companyId = req.company.id;
    const clientId = req.params.clientId;
    const { year = currentYear } = req.query;
    const transactions = await prisma.transaction.findMany({
      where: {
        clientId: clientId,
        companyId: Number(companyId),
        date: {
          gte: new Date(Number(year), 0, 1),
          lte: new Date(Number(year), 11, 31),
        },
      },
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, transactions, "Transactions fetched successfully")
      );
  }
);

export const getAllTransactionsForCompanyForMonth = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const companyId = req.company.id;
    const { year = currentYear, month = currentMonth } = req.query;
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        companyId: Number(companyId),
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, transactions, "Transactions fetched successfully")
      );
  }
);

export const getAllTransactionsForCompanyForMonthGroupedByClient = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const companyId = req.company.id;
    const { year = currentYear, month = currentMonth } = req.query;
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 1);

    const transactions = await prisma.$queryRaw<
      {
        id: number;
        amount: number;
        date: Date;
        clientId: string;
        clientName: string;
      }[]
    >`
    SELECT t.id, t.amount, t.date, t.type, COALESCE(t.description, '') as description, t."clientId", c."name" AS "clientName"
    FROM "Transaction" t
    JOIN "Client" c on t."clientId" = c.id
    where t."companyId" = ${Number(companyId)} AND t.date >= ${startDate} AND t.date < ${endDate}
    ORDER BY c."name", t.date;
    `;

    const totals = await prisma.$queryRaw<
      { clientId: string; clientName: string; totalAmount: number }[]
    >`
    SELECT t."clientId", c."name" AS "clientName", SUM(
      CASE
        WHEN t.type = 'CREDIT' THEN t.amount
        WHEN t.type = 'DEBIT' THEN -t.amount
        ELSE 0
      END
    ) AS "totalAmount"
    FROM "Transaction" t
    JOIN "Client" c on t."clientId" = c.id
    where t."companyId" = ${Number(companyId)}
    AND t.date >= ${startDate} AND t.date < ${endDate}
    GROUP BY t."clientId", c."name"
    ORDER BY c."name";
    `;

    const grouped = totals.map((t) => ({
      clientName: t.clientName,
      total: Number(t.totalAmount),
      transactions: transactions.filter((tr) => tr.clientId === t.clientId),
    }));
    return res
      .status(200)
      .json(new ApiResponse(200, grouped, "Transactions fetched successfully"));
  }
);
