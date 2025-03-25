import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { generateAccessToken, generateRefreshToken } from "../utils/auth";
import prisma from "../db/db";

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
