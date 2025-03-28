import { Router } from "express";
import { authenticateSession } from "../middleware/auth";
import {
  createTransporter,
  deleteTransporter,
  getAllTransporters,
  getTransporterById,
  updateTransporter,
} from "../controller/transporter.controller";

const router = Router();

router.route("/").get(authenticateSession, getAllTransporters);
router.route("/add").post(authenticateSession, createTransporter);
router
  .route("/:id")
  .get(authenticateSession, getTransporterById)
  .put(authenticateSession, updateTransporter)
  .delete(authenticateSession, deleteTransporter);

export default router;
