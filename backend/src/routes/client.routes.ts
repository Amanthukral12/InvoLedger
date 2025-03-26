import { Router } from "express";
import { authenticateSession } from "../middleware/auth";
import {
  createClient,
  deleteClient,
  getAllClients,
  getClientById,
  updateClient,
} from "../controller/client.controller";

const router = Router();

router.route("/").get(authenticateSession, getAllClients);
router.route("/add").post(authenticateSession, createClient);
router
  .route("/:id")
  .get(authenticateSession, getClientById)
  .put(authenticateSession, updateClient)
  .delete(authenticateSession, deleteClient);

export default router;
