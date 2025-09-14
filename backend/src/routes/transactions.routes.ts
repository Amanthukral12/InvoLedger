import { Router } from "express";
import { authenticateSession } from "../middleware/auth";
import {
  createTransaction,
  deleteTransaction,
  getAllTransactionsForClient,
  getAllTransactionsForCompanyForMonth,
  getAllTransactionsForCompanyForMonthGroupedByClient,
} from "../controller/transaction.controller";

const router = Router();

router.route("/:clientId/add").post(authenticateSession, createTransaction);
router.route("/add").post(authenticateSession, createTransaction);
router
  .route("/:clientId/getTransactions")
  .get(authenticateSession, getAllTransactionsForClient);
router
  .route("/")
  .get(authenticateSession, getAllTransactionsForCompanyForMonth);
router
  .route("/groupedByClient")
  .get(
    authenticateSession,
    getAllTransactionsForCompanyForMonthGroupedByClient
  );

router.route("/:clientId/:id").delete(authenticateSession, deleteTransaction);

export default router;
