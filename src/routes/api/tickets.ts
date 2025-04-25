import { Router } from "express";
import { VerifyTicket } from "../../controllers/tickets";

const router = Router();

router.post("/verify", VerifyTicket);

export default router;
