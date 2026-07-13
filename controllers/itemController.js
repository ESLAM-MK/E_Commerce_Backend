import Item from "../Models/Item.js"
import Notification from "../Models/Notifications.js"
import User from "../Models/user.js"
import { SendNewItemNotifications } from "../services/notificationService.js"
import notificationTemplete from "../utils/notificationTemplete.js"
import asyncHandler from "express-async-handler"
export const getItem = asyncHandler( async (req, res, next) => {
        const { id } = req.params
        const item = await Item.findById(id).populate("employee")
        if (!item) {
            return res.status(404).json({ success: false, message: "not found" })
        }
        item.views += 1
        await item.save()
        return res.status(200).json({ success: true, message: "exist", item: item })
}) 
export const getAllItems = asyncHandler(async (req, res,next) => {

        const finalFilter = {};
        if (req.query.category) {
            finalFilter.category = req.query.category;
        }
        finalFilter.price = {};
        const gte = req.query.price?.gte || req.query['price[gte]'];
        const lte = req.query.price?.lte || req.query['price[lte]'];
        const gt = req.query.price?.gt || req.query['price[gt]'];
        const lt = req.query.price?.lt || req.query['price[lt]'];
        if (gte) finalFilter.price.$gte = Number(gte); // {price:{$gte :Number(gte)}}
        if (lte) finalFilter.price.$lte = Number(lte);
        if (gt) finalFilter.price.$gt = Number(gt);
        if (lt) finalFilter.price.$lt = Number(lt);

        const page = parseInt(req.query.page, 10) || 1; 
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const totalItems = await Item.countDocuments(finalFilter);
        const totalPages = Math.ceil(totalItems / limit);

        const items = await Item.find(finalFilter)  // may use projection of strings| array | object
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }) // sort for latest 
            .populate("employee");

        return res.status(200).json({
            success: true,
            count: items.length,
            Pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
                limit: limit
            },
            items: items
        });
    
})

export const deleteItem = asyncHandler(async (req, res,next) => {
    
        const { id } = req.params
        const item = await Item.findById(id)
        if (!item) {
            return res.status(404).json({ success: false, message: "not found" })
        }
        if (item.employee.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "not authorized" })
        }
        await item.deleteOne()
        return res.status(200).json({ success: true, data: null })
    
})

export const addItem =asyncHandler( async (req, res,next) => {
        const { title, description, price, quantity, category } = req.body
        if (!title || !category || !price || !quantity) {
            return res.status(400).json({ success: false, message: "all fields are required" })
        }
        const imagesUrl = req.files ? req.files.map(f => f.path) : []
        const newItem = await Item.create({ title, description, price, quantity, category, images: imagesUrl, employee: req.user._id })
         res.status(201).json({ success: true, message: "added successfully",data: newItem})
         setImmediate(()=>{
            SendNewItemNotifications(newItem,req.io).catch((error)=>{
                console.log("Background Notification Error",error)
            })
         })
       
})
export const updateItem =asyncHandler( async (req, res,next) => {
   
        const imagesUrl = req.files ? req.files.map(f => f.path) : []
        let incomingImages = req.body.images || [];
        if (typeof incomingImages === 'string') incomingImages = [incomingImages];
        const oldItem = await Item.findById(req.params.id).populate("employee")
        if (!oldItem) {
            return res.status(404).json({ success: false, message: "not found" })
        }
        if (oldItem.employee.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "not authorized" })
        }
        let fileCounter = 0;
        const finalImages = oldItem.images.map((oldUrl, index) => {
            if (incomingImages.includes(oldUrl)) {
                return oldUrl
            } else {
                const newUrl = imagesUrl[fileCounter]
                if (newUrl) {
                    fileCounter++;
                    return newUrl;
                } else {
                    return oldUrl;
                }
            }
        })
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, { ...req.body, images: finalImages },{new:true})
        return res.status(200).json({ success: true, message: "updated successfully", updateItem: updateItem })
})