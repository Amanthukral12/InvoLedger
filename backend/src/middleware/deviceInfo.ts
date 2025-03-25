import { NextFunction, Request, Response } from "express";

export interface CustomRequest extends Request {
  deviceInfo?: string;
}
export const deviceInfo = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userAgent = req.headers["user-agent"] || "Unknown Device";
  req.deviceInfo = JSON.stringify(userAgent);
  next();
};
