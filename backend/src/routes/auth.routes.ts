import { Router } from "express";
import passport from "passport";
import { deviceInfo } from "../middleware/deviceInfo";
import { googleLoginSuccess } from "../controller/auth.controller";

const router = Router();

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/auth/google/callback",
  deviceInfo,
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleLoginSuccess
);

export default router;
