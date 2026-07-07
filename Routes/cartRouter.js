import express from "express"
import {buyerOnly} from "../middlewares/authMiddleware.js"
import { addToCart, getCart, mergeCart, removeFromCart } from "../controllers/cartController.js"
const router = express.Router()
router.get('/',getCart)
router.post('/add',addToCart)
router.post('/merge',mergeCart)
router.delete('/remove/:itemId',removeFromCart)
export default router