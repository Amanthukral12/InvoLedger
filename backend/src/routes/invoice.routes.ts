import { Router } from "express";
import { authenticateSession } from "../middleware/auth";
import {
  createInvoice,
  deleteInvoice,
  generateInvoice,
  getAllInvoicesForCompany,
  getInvoiceById,
  updateInvoice,
} from "../controller/invoice.controller";

const router = Router();

router.route("/add").post(authenticateSession, createInvoice);
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
