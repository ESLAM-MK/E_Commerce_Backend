import express from "express"
import { adminOnly, buyerOnly, protect } from "../middlewares/authMiddleware.js"
import { getAllOrders, getMyOrders,getOrder,placeOrder, updateOrder } from "../controllers/orderController.js"
const router =express.Router()
router.post('/place-order',protect,buyerOnly,placeOrder)
router.get('/my-orders',protect,buyerOnly,getMyOrders)
router.get('/all-orders',protect,adminOnly,getAllOrders)
router.get('/:id',protect,buyerOnly,getOrder)
router.put('/:id',protect,adminOnly,updateOrder)
export default router