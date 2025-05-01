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
    const clientId = req.params.clientId;

    const { amount, type, date, description } = req.body;

    if (!clientId || !amount || !type || !date) {
      throw new ApiError(400, "Please fill all the fields", [
        "Please fill all the fields",
      ]);
    }

    const transaction = await prisma.$transaction(async (prisma) => {
      const newTransaction = await prisma.transaction.create({
        data: {
          companyId,
          clientId,
          amount,
          type,
          date,
          description,
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
