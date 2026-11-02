import { Router } from "express";
import sessionRoutes from "./session.routes";
import teacherRoutes from "./teacher.routes";
import userRoutes from "./user.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});
router.use("/users", userRoutes);
router.use("/teachers", teacherRoutes);
router.use("/sessions", sessionRoutes);

export default router;
