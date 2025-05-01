import { Router } from "express";
import { authenticateSession } from "../middleware/auth";
import {
  createTransaction,
  deleteTransaction,
  getAllTransactionsForClient,
} from "../controller/transaction.controller";

const router = Router();

router.route("/:clientId/add").post(authenticateSession, createTransaction);
router
  .route("/:cliendId/getTransactions")
  .get(authenticateSession, getAllTransactionsForClient);

router.route("/:clientId/:id").delete(authenticateSession, deleteTransaction);

export default router;
