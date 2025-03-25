import { Router } from "express";
import passport from "passport";
import { deviceInfo } from "../middleware/deviceInfo";
import {
  getAllSessions,
  getCurrentCompany,
  getCurrentSession,
  googleLoginSuccess,
  logout,
  refreshAccessToken,
  updateCompanyProfile,
} from "../controller/auth.controller";
import { authenticateSession } from "../middleware/auth";

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

router.route("/auth/session").get(authenticateSession, getCurrentSession);
router.route("/auth/allSessions").get(authenticateSession, getAllSessions);
router
  .route("/auth/profile")
  .get(authenticateSession, getCurrentCompany)
  .put(authenticateSession, updateCompanyProfile);
router.route("/auth/logout").post(authenticateSession, logout);
router.route("/auth/refresh-token").post(refreshAccessToken);

export default router;
