import asyncHandler from "express-async-handler"
import Item from "../Models/Item.js"
import Cart from "../Models/Cart.js"
export const addToCart = asyncHandler(async(req , res)=>{ // for auth buyers
    const {itemId , quantity } = req.body
    const item = await Item.findById(itemId)
    if(!item){
        return res.status(404).json({success:false , message :"item not found"})
    }
    if(item.quantity<quantity){ // check quantity in stock first
         return res.status(400).json({success:false , message :"quantity does not available"})
    }
    const cart = await Cart.findOneAndUpdate(
    { userId: req.user._id, "items.itemId": itemId },
    { 
        $inc: { "items.$.quantity": quantity } 
    },
    { new: true }
)
   if (cart) {
    const updatedItem = cart.items.find(i => i.itemId.toString() === itemId.toString())
    if (updatedItem.quantity > item.quantity) {
        updatedItem.quantity = item.quantity // add available quantity only
        await cart.save();
        const updatedCart = await Cart.findOne({ userId: req.user._id }).populate("items.itemId")
        return res.status(200).json({ success: true, message: `available quantity only added (${item.quantity})`,data:updatedCart})
    }
} else {
    await Cart.findOneAndUpdate(
        { userId: req.user._id },
        { 
            $push: { items: { itemId, quantity } } 
        },
        { upsert: true, new: true }
    );
}

const finalCart = await Cart.findOne({ userId: req.user._id }).populate("items.itemId")
return res.status(200).json({ success: true, message: "added successfully", data: finalCart })
})

export const mergeCart = asyncHandler (async(req ,res)=>{ // for guest that save thier cart in cashe like local storage
    const {guestItems} = req.body
    const userId = req.user._id
    if(!guestItems || guestItems.length ===0 || !Array.isArray(guestItems)){
        return res.status(400).json({success:false,message:"not items saved in cashe"})
    }
    let cart = await Cart.findOne({userId})
    if(!cart){
        cart = await Cart.create({
            userId : userId,
            items: []
        })
    }
    for( let guestItem of guestItems){
         const item = await Item.findById(guestItem.itemId)
         if(!item){
            continue
         }
        const itemIndex = cart.items.findIndex(i => i.itemId.toString() === guestItem.itemId)
        if(itemIndex > -1){
            const newQuantity= cart.items[itemIndex].quantity+ guestItem.quantity
            cart.items[itemIndex].quantity =Math.min(item.quantity , newQuantity)
        }else{
            const totalQuantity = Math.min( item.quantity ,guestItem.quantity)
            cart.items.push({
                itemId:guestItem.itemId,
                quantity:totalQuantity   
            })
        }
    }
    await cart.save()
    const mergedCart = await Cart.findOne({userId}).populate("items.itemId")
    res.status(201).json({success:true , message:"cart created successfully" ,data:mergedCart})
})

export const removeFromCart = asyncHandler(async(req ,res)=>{
    const {itemId} = req.body
    const userId = req.user._id
    let cart = await Cart.findByIdAndUpdate({userId} , 
        {$pull:{items:{itemId:itemId}}}
    ,{new:true}).populate("items.itemId")
    if(!cart){
        return res.status(404).json({ success: false, message: "Cart not found" })
    }
        return res.status(200).json({success: true,message: "Item removed from cart successfully",data: cart  })
})