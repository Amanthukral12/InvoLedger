import jwt from "jsonwebtoken";
import { AccessTokenPayload, RefreshTokenPayload } from "../types/types";
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "30d",
  });
};

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

export const verifyRefreshToken = (
  token: string
): RefreshTokenPayload | null => {
  try {
    return jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET!
    ) as RefreshTokenPayload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    return jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as AccessTokenPayload;
  } catch (error) {
    throw new Error("Invalid Access Token");
  }
};
