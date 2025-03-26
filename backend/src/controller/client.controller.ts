import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import prisma from "../db/db";
import { ApiResponse } from "../utils/ApiResponse";

export const createClient = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;

    const { name, address, GSTIN, email, phonenumber, state } = req.body;

    if (!name || !address || !GSTIN || !email || !phonenumber || !state) {
      throw new ApiError(400, "Please fill all the fields", [
        "Please fill all the fields",
      ]);
    }

    const client = await prisma.client.create({
      data: {
        name,
        address,
        GSTIN,
        email,
        phonenumber,
        state,
        companyId,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, client, "Client created successfully"));
  }
);

export const deleteClient = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const clientId = req.params.id;
    const clientExists = await prisma.client.findFirst({
      where: { id: clientId, companyId },
    });

    if (!clientExists) {
      throw new ApiError(404, "Client not found", ["Client not found"]);
    }

    await prisma.client.delete({
      where: { id: clientExists.id },
    });

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Client deleted successfully"));
  }
);

export const updateClient = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }

    const companyId = req.company.id;
    const clientId = req.params.id;
    const { name, address, GSTIN, email, phonenumber, state } = req.body;

    const clientExists = await prisma.client.findFirst({
      where: { id: clientId, companyId },
    });

    if (!clientExists) {
      throw new ApiError(404, "Client not found", ["Client not found"]);
    }

    const client = await prisma.client.update({
      where: { id: clientExists.id },
      data: {
        name: name !== undefined ? name : undefined,
        address: address !== undefined ? address : undefined,
        GSTIN: GSTIN !== undefined ? GSTIN : undefined,
        email: email !== undefined ? email : undefined,
        phonenumber: phonenumber !== undefined ? phonenumber : undefined,
        state: state !== undefined ? state : undefined,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, client, "Client updated successfully"));
  }
);

export const getAllClients = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;

    const clients = await prisma.client.findMany({
      where: { companyId },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, clients, "Clients fetched successfully"));
  }
);

export const getClientById = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }

    const companyId = req.company.id;
    const clientId = req.params.id;
    const { name, address, GSTIN, email, phonenumber, state } = req.body;

    const clientExists = await prisma.client.findFirst({
      where: { id: clientId, companyId },
    });

    if (!clientExists) {
      throw new ApiError(404, "Client not found", ["Client not found"]);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, clientExists, "Client fetched successfully"));
  }
);
