import asyncHandler from "express-async-handler"
import Cart from "../Models/Cart.js"
import { redlock } from "../utils/locks.js"
import Item from "../Models/Item.js"
import Order from "../Models/Order.js"
import { createPaymobPayment } from "../services/paymobService.js"
export const placeOrder = asyncHandler(async (req, res) => {
    const { city, street, phone, name, notes } = req.body
    if (!city || !street || !phone || !name) {
        return res.status(400).json({ success: false, message: "shipping address is required" })
    }
    const cart = await Cart.findOne({ userId: req.user._id }).populate("items.itemId")
    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: "cart is empty" })
    }
    const redlocks = cart.items.map(item => `locks:item:${item.itemId._id}`)
    let lock
    let stockHeld = false
    try {
        lock = await redlock.acquire(redlocks, 5000)
        for (const cartItem of cart.items) {
            if (cartItem.quantity > cartItem.itemId.quantity) {
                return res.status(400).json({ success: false, message: "quantity not available" });
            }
        }
        for (const cartItem of cart.items) {
            await Item.findByIdAndUpdate(cartItem.itemId._id, {
                $inc: { quantity: -cartItem.quantity }
            })
        }
        stockHeld = true
        const orderItems = cart.items.map(item => ({
            itemId: item.itemId._id,
            quantity: item.quantity,
            priceAtPurchase: item.itemId.price
        }));
        const totalPrice = cart.items.reduce(
            (acc, item) => acc + item.quantity * item.itemId.price,
            0
        )
        const newOrder = await Order.create({
            userId: req.user._id,
            addressInfo: { ...req.body },
            totalPrice,
            items: orderItems,
            paymentStatus: 'Pending'
        });

        const { iframeUrl, paymobOrderId } = await createPaymobPayment(newOrder, req.user)
        
        newOrder.paymentInfo = {paymobId: paymobOrderId.toString() }
        await newOrder.save()
        return res.status(200).json({
            success: true,
            message: "payment request has been created successfully",
            paymentUrl: iframeUrl,
            orderId: newOrder._id
        })
    } catch (error) {
        console.error("Checkout Error:", error)

        if (stockHeld) {
            for (const cartItem of cart.items) {
                await Item.findByIdAndUpdate(cartItem.itemId._id, {
                    $inc: { quantity: cartItem.quantity }
                }).catch(() => {})
            }
        }

        return res.status(500).json({
            success: false,
            message: "something went wrong please try later"
        });
    } finally {
        if (lock) {
            await lock.release().catch(() => {})
        }
    }
})

export const getMyOrders =asyncHandler(async (req , res )=>{ // called by buyer only
    const userId = req.user._id
    const {orderStatus} =req.query
    const  page = Number(req.query.page) || 1
    const limit =Number(req.query.limit) || 9
    const skip =(page-1) * limit
    const finalQuery ={}
    finalQuery.userId=userId
    orderStatus? finalQuery.orderStatus=orderStatus:finalQuery
    const [Orders,totalOrders]=await Promise.all([
        Order.find(finalQuery).sort({createdAt:-1}).skip(skip).limit(limit).populate("items.itemId"),
        Order.countDocuments(finalQuery)
   ])
    const totalPages = Math.ceil(totalOrders/limit)
    return res.status(200).json({success:true,
        currentPage:page,
        totalPages,
        Orders,
        totalOrders,
        message: "Orders retrieved successfully"
    })
})

export const getAllOrders =asyncHandler(async (req , res )=>{ // called by admin only
    const {orderStatus} =req.query
    const  page = Number(req.query.page) || 1
    const limit =Number(req.query.limit) || 9
    const skip =(page-1) * limit
    const finalQuery ={}
    if(orderStatus){
     finalQuery.orderStatus=orderStatus
    }
    const [Orders,totalOrders]=await Promise.all([
        Order.find(finalQuery).sort({createdAt:-1}).skip(skip).limit(limit).populate("userId", "name email").populate("items.itemId").lean(), // lean for read only
        Order.countDocuments(finalQuery)
   ])
    const totalPages = Math.ceil(totalOrders/limit)
    return res.status(200).json({success:true,
        currentPage:page,
        totalPages,
        Orders,
        totalOrders,
        message: "Orders retrieved successfully"
    })
})
export const getOrder = asyncHandler(async( req , res)=>{
    const userId =req.user._id
    const order = await Order.findOne({_id:req.params.id,userId}).populate("items.itemId").lean() // read only
    if(!order){
         return res.status(404).json({success:false, message: "order not found"})
    }
    return res.status(200).json({success:true,message: "order retrieved successfully" ,data:order})
})
export const updateOrder = asyncHandler(async (req, res) => { // called by admin to update order status
    const { orderStatus } = req.body; 
    const validStatuses = [ "processing", "shipped", "delivered"]
    if (!orderStatus || !validStatuses.includes(orderStatus)) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing order status"
        })
    }
    const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id, 
        { orderStatus }, 
        { new: true, runValidators: true }
    ).populate("items.itemId");

    if (!updatedOrder) {
        return res.status(404).json({
            success: false,
            message: "Order not found"
        })
    }
    return res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: updatedOrder
    })
})
