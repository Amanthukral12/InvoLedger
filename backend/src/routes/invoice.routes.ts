import { Router } from "express";
import { authenticateSession } from "../middleware/auth";
import {
  createInvoice,
  deleteInvoice,
  generateInvoice,
  getAllInvoicesForCompany,
  getAllInvoicesForMonthForCompany,
  getInvoiceById,
  getInvoiceCount,
  getInvoicesSummary,
  updateInvoice,
} from "../controller/invoice.controller";

const router = Router();

router.route("/add").post(authenticateSession, createInvoice);
router.route("/getInvoicesCount").get(authenticateSession, getInvoiceCount);
router.route("/invoicesSummary").get(authenticateSession, getInvoicesSummary);
router
  .route("/invoicesformonthcompany")
  .get(authenticateSession, getAllInvoicesForMonthForCompany);
router.route("/").get(authenticateSession, getAllInvoicesForCompany);
router
  .route("/generate-invoice/:id")
  .post(authenticateSession, generateInvoice);
router
  .route("/:id")
  .put(authenticateSession, updateInvoice)
  .delete(authenticateSession, deleteInvoice)
  .get(authenticateSession, getInvoiceById);

export default router;
