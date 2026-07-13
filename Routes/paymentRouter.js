import express from "express"
import { paymobWebhook } from "../controllers/paymentController.js"
const router =express.Router()
router.post("/paymob-webhook", paymobWebhook);
export default router