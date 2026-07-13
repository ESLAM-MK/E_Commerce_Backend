import asyncHandler from "express-async-handler"
import crypto from "crypto"
import Order from "../Models/Order.js"
import Cart from "../Models/Cart.js"
import Item from "../Models/Item.js"
import { sendNewOrderNotificationToAdmins } from "../services/notificationService.js"
export const paymobWebhook = asyncHandler(async(req ,res)=>{
    const {obj} = req.body 
    if(!obj || !obj.order){ // check if object of request body is exist and have order
        return res.status(400).json({success:false,message:"Invalid Webhook Payload"})
    }
    if(process.env.NODE_ENV!=="development"){  // for security at deployement 
        const hmacHeader = req.query.hmac
        const hmacSecret = process.env.PAYMOB_HMAC
        const concatenatedData = 
            `${obj.amount_cents}` +
            `${obj.created_at}` +
            `${obj.currency}` +
            `${obj.error_occured}` +
            `${obj.has_parent_transaction}` +
            `${obj.id}` +
            `${obj.integration_id}` +
            `${obj.is_3d_secure}` +
            `${obj.is_auth}` +
            `${obj.is_capture}` +
            `${obj.is_refunded}` +
            `${obj.is_standalone_payment}` +
            `${obj.is_voided}` +
            `${obj.order.id}` +
            `${obj.owner}` +
            `${obj.pending}` +
            `${obj.source_data.pan}` +
            `${obj.source_data.sub_type}` +
            `${obj.source_data.type}` +
            `${obj.success}`

        const calculatedHmac = crypto
            .createHmac("sha512", hmacSecret) // sha512 // hashing algorithm
            .update(concatenatedData)
            .digest("hex")

        if (calculatedHmac !== hmacHeader) {
            return res.status(400).send("Unauthorized Webhook Request")
        
    }
    }
    const paymobOrderId = obj.order.id.toString() // get paymob order Id
    const isSuccess = obj.success === true && obj.pending === false // check if payment success or not and check about pending
    const transactionId = obj.id.toString() // get transactionId
    const order = await Order.findOne({"paymentInfo.paymobId":paymobOrderId}) // get Order
    if(!order){
        return res.status(200).json({success:false,message:"Order not found"}) // send status 200 for paymob 
    }
    if(isSuccess && order.paymentStatus !== "Paid"){  // handle after  success payment
        order.paymentStatus ="Paid" // change payment status
        order.paymentInfo.transactionId=transactionId // add transaction id
        order.orderStatus ="Placed"
        await order.save()
        await Cart.findOneAndUpdate({userId:order.userId},{items:[]}) // make cart of this user empty
        setImmediate(()=>{
            sendNewOrderNotificationToAdmins(order ,req.io).catch(err => {
            console.error("Admin Order Notification Error:", err)
        })
        })
    }
   else if(!isSuccess && order.paymentStatus === "Pending"){ // handle failure of payment
        order.paymentStatus = 'Failed'
         await order.save()
         for(let item of order.items){ // return all quantity as it's before reservetion
            await Item.findByIdAndUpdate(item.itemId,{
               $inc:{quantity:item.quantity}
            })
         }
    }
            return res.status(200).send("OK")
})