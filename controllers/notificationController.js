import asyncHandler from "express-async-handler"
import Notification from "../Models/Notifications.js"
export const myNotifications = asyncHandler(async (req, res) => {
    const { unReaded } = req.query
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit
    const query = { recipient: req.user._id }
    if (unReaded === "true") query.isRead = false
    const { notifications, totalNotifications, unReadedNotifications } = await Promise.all(
        Notification.find(query).sort({ createAt: -1 }).skip(skip).limit(limit),
        Notification.countDocuments(query),
        Notification.countDocuments({ recipient: req.user._id, isRead = false })
    )
    const pages = Math.ceil(totalNotifications / limit)
    return res.status(200).json({
        notifications:notifications,
        unReadedCount:unReadedNotifications,
        totalPages: pages,
        currentPage:page,
        totalNotifications :totalNotifications
    })
}) 

export const markAsRead = asyncHandler(async(req , res)=>{
    const notification =await Notification.findByIdAndUpdate({recipient:req.user._id, _id:req.params.id},
        {isRead:true}
    )
    return res.status(200).json({success:true , message :"marked as readed sucessfully" , data:null})
})


export const markAllAsRead = asyncHandler(async(req , res)=>{ 
  await Notification.updateMany({recipient:req.user._id , isRead: false},{isRead:true})
        return res.status(200).json({success:true , message :"All marked as readed sucessfully" , data:null})
})

export const deleteNotification = asyncHandler(async(req , res)=>{ 
    await Notification.findByIdAndDelete({_id :req.params.id ,recipient: req.user._id,} ,{new :true})
    return res.status(200).json({success:true , message :"notification has been deleted successfully" , data:null})
})