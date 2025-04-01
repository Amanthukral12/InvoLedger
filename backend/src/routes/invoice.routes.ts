import { Router } from "express";
import { authenticateSession } from "../middleware/auth";
import { createInvoice } from "../controller/invoice.controller";

const router = Router();

router.route("/add").post(authenticateSession, createInvoice);

export default router;
