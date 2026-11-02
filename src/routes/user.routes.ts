import { Router } from "express";
import { createUser, getUserSessions } from "../controllers/user.controller";

const router = Router();

router.post("/", createUser);
router.get("/:id/sessions", getUserSessions);

export default router;
