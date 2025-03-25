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
