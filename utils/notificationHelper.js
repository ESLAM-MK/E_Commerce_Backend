import Notification from "../Models/Notifications.js"

 const sendNotification = async({recipient,title,body,refModel,refId,type})=>{
    const newNotification = await new Notification.create({
        recipient:recipient,
        title:title,
        body:body,
        refModel:refModel,
        refId:refId,
        type:type
    })
    await newNotification.save()
}
export default sendNotification
