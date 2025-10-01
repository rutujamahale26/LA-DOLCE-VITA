import express from "express";
import { createCheckout,  stripeWebhook } from "../controllers/stripeCheckoutController.js";

const router = express.Router();

router.post("/checkout",createCheckout);

router.post("/webhook", stripeWebhook);


export default router;
