import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import prisma from "../db/db";
import { ApiResponse } from "../utils/ApiResponse";

export const createTransporter = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const { name, address, GSTIN, state } = req.body;

    if (!name || !address || !GSTIN || !state) {
      throw new ApiError(400, "Please fill all the fields", [
        "Please fill all the fields",
      ]);
    }

    const transporter = await prisma.shipToParty.create({
      data: {
        name,
        address,
        GSTIN,
        state,
        companyId,
      },
    });
    return res
      .status(201)
      .json(
        new ApiResponse(201, transporter, "Transported created successfully")
      );
  }
);

export const deleteTransporter = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const transporterId = req.params.id;
    const transporterExists = await prisma.shipToParty.findFirst({
      where: { id: transporterId, companyId },
    });

    if (!transporterExists) {
      throw new ApiError(404, "Transporter not found", [
        "Transporter not found",
      ]);
    }

    await prisma.shipToParty.delete({
      where: { id: transporterExists.id, companyId },
    });

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Transporter deleted successfully"));
  }
);

export const updateTransporter = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const transporterId = req.params.id;
    const { name, address, GSTIN, state } = req.body;
    const transporterExists = await prisma.shipToParty.findFirst({
      where: { id: transporterId, companyId },
    });
    if (!transporterExists) {
      throw new ApiError(404, "Transporter not found", [
        "Transporter not found",
      ]);
    }

    const transporter = await prisma.shipToParty.update({
      where: { id: transporterId, companyId },
      data: {
        name: name !== undefined ? name : undefined,
        address: address !== undefined ? address : undefined,
        GSTIN: GSTIN !== undefined ? GSTIN : undefined,
        state: state !== undefined ? state : undefined,
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, transporter, "Transporter updated successfully")
      );
  }
);

export const getAllTransporters = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const transporters = await prisma.shipToParty.findMany({
      where: { companyId },
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          transporters,
          "All transporters fetched successfully"
        )
      );
  }
);

export const getTransporterById = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const transporterId = req.params.id;

    const transporter = await prisma.shipToParty.findFirst({
      where: { id: transporterId, companyId },
    });

    if (!transporter) {
      throw new ApiError(404, "Transporter not found", [
        "Transporter not found",
      ]);
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, transporter, "Transporter fetched successfully")
      );
  }
);
