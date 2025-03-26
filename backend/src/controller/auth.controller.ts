import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/auth";
import prisma from "../db/db";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

export const googleLoginSuccess = asyncHandler(
  async (req: any, res: Response) => {
    const { company } = req.user;
    const deviceInfo = req.deviceInfo;
    const refreshToken = generateRefreshToken({
      sessionId: req.user.sessionId,
    });

    const session = await prisma.session.create({
      data: {
        companyId: company.id,
        refreshToken,
        deviceInfo,
        sessionId: req.user.sessionId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    const accessToken = generateAccessToken({
      companyId: company.id,
      sessionId: session.sessionId,
    });

    res
      .status(200)
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .redirect(process.env.FRONTEND_URL!);
  }
);

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const incomingRefreshToken =
      req.cookies?.refresh_token || req.body.refresh_token;

    if (!incomingRefreshToken) {
      const options = {
        httpOnly: true,
        secure: true,
      };
      res.clearCookie("access_token", options);
      res.clearCookie("refresh_token", options);
      throw new ApiError(401, "Unauthorized request", ["Unauthorized request"]);
    }
    const decodedToken = verifyRefreshToken(incomingRefreshToken);
    const session = await prisma.session.findUnique({
      where: { sessionId: decodedToken?.sessionId },
    });
    const options = {
      httpOnly: true,
      secure: true,
    };
    if (!session) {
      res
        .status(401)
        .clearCookie("access_token", options)
        .clearCookie("refresh_token", options);
      throw new ApiError(401, "Invalid session", ["Invalid session"]);
    }
    if (session.expiresAt < new Date()) {
      await prisma.session.delete({
        where: { id: session.id },
      });
      res
        .status(401)
        .clearCookie("access_token", options)
        .clearCookie("refresh_token", options);
      throw new ApiError(401, "Session Expired. Please login again", [
        "Session Expired. Please login again",
      ]);
    }
    const accessToken = generateAccessToken({
      companyId: session.companyId,
      sessionId: session.sessionId,
    });

    await prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });
    res
      .status(200)
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
      })
      .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.currentSession) {
    throw new ApiError(401, "No active session", ["No Active session"]);
  }
  await prisma.session.delete({
    where: { id: req.currentSession.id },
  });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("access_token", options)
    .clearCookie("refresh_token", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const updateCompanyProfile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;

    const {
      name,
      GST,
      Address,
      PhoneNumber,
      state,
      companyOwnerSignnature,
      companyBankName,
      companyBankAccountNumber,
      companyBankIFSC,
    } = req.body;

    const companyDetails = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: name !== undefined ? name : undefined,
        GST: GST !== undefined ? GST : undefined,
        Address: Address !== undefined ? Address : undefined,
        PhoneNumber: PhoneNumber !== undefined ? PhoneNumber : undefined,
        state: state !== undefined ? state : undefined,
        companyOwnerSignnature:
          companyOwnerSignnature !== undefined
            ? companyOwnerSignnature
            : undefined,
        companyBankName:
          companyBankName !== undefined ? companyBankName : undefined,
        companyBankAccountNumber:
          companyBankAccountNumber !== undefined
            ? companyBankAccountNumber
            : undefined,
        companyBankIFSC:
          companyBankIFSC !== undefined ? companyBankIFSC : undefined,
      },
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          companyDetails,
          "Company details updated successfully"
        )
      );
  }
);

export const getCurrentSession = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const currentSession = req.currentSession;
    const currentCompany = req.company;
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { currentCompany, currentSession },
          "Current Session fetched successfully"
        )
      );
  }
);

export const getCurrentCompany = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }

    const currentCompany = req.company;

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          currentCompany,
          "Fetch current company successfully"
        )
      );
  }
);

export const getAllSessions = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.company) {
      throw new ApiError(401, "Unauthorized Access. Please login again", [
        "Unauthorized Access. Please login again",
      ]);
    }
    const companyId = req.company.id;
    const sessions = await prisma.session.findMany({
      where: { companyId },
      omit: {
        refreshToken: true,
      },
    });
    if (!sessions) {
      throw new ApiError(404, "No sessions found", ["No sessions found"]);
    }
    return res
      .status(200)
      .json(new ApiResponse(200, sessions, "Sessions fetched successfully"));
  }
);
