import { Router } from "express";
import { createTeacher } from "../controllers/teacher.controller";

const router = Router();

router.post("/", createTeacher);

export default router;
