import { Router } from "express";
import ticketRoutes from "./tickets";

const router = Router();

router.use("/tickets", ticketRoutes);

export default router;
