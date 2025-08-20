import { Router } from "express";
import { authenticateSession } from "../middleware/auth";
import {
  createPurchase,
  deletePurchase,
  getAllPurchasesForCompany,
  getAllPurchasesForMonthForCompany,
  getPurchaseById,
  getPurchasesSummary,
  updatePurchase,
} from "../controller/purchase.controller";

const router = Router();

router.route("/add").post(authenticateSession, createPurchase);
router.route("/purchasesSummary").get(authenticateSession, getPurchasesSummary);
router
  .route("/purchasesformonthcompany")
  .get(authenticateSession, getAllPurchasesForMonthForCompany);
router.route("/").get(authenticateSession, getAllPurchasesForCompany);
router
  .route("/:id")
  .get(authenticateSession, getPurchaseById)
  .put(authenticateSession, updatePurchase)
  .delete(authenticateSession, deletePurchase);

export default router;
