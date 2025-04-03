import { Router } from "express";
import { authenticateSession } from "../middleware/auth";
import {
  createInvoice,
  generateInvoice,
} from "../controller/invoice.controller";

const router = Router();

router.route("/add").post(authenticateSession, createInvoice);
router
  .route("/generate-invoice/:id")
  .post(authenticateSession, generateInvoice);

export default router;
