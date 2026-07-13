import Notification from "../Models/Notifications.js"
import User from "../Models/User.js"
import notificationTemplete from "../utils/notificationTemplete.js"

export const SendNewItemNotifications =async(newItem ,io)=>{
    const batchSize = 200 // 200 buyers maxmuim
    const buyerCursor =  User.find({role:"buyer"}).select("_id").cursor()
    let buyersBatch =[]
    for await (let buyer of buyerCursor){
        buyersBatch.push(buyer)
        if(buyersBatch.length>=batchSize){
            await processNotificationBatch(buyersBatch, newItem, io)
            buyersBatch=[]
        }
    }
    if(buyersBatch.length>0){
         await processNotificationBatch(buyersBatch, newItem, io)
    }

}
const processNotificationBatch =async(buyersBatch,newItem, io)=>{
    try{
            const notificationsData = buyersBatch.map(buyer => ({
                recipient: buyer._id,
                title: notificationTemplete.new_item.title,
                body: notificationTemplete.new_item.body(newItem.title),
                refModel: "Item",
                    refId: newItem._id,
                    type: "new_Item"
                }))
                const notificationsToSave = await Notification.insertMany(notificationsData)
                notificationsToSave.forEach((notification,index)=>{
                 io.to(`${notification.recipient}`).emit("notification", {
                _id: notification._id,
                type: notification.type,
                title: notification.title,
                body: notification.body,
                refModel: notification.refModel,
                refId: notification.refId,
                isRead: false,
                createdAt: notification.createdAt
            })
        })
            }catch(error){
                console.error("Error processing notification batch:", error);
            }
            
}