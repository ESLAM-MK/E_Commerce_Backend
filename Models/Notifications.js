import mongoose, { Mongoose } from "mongoose";
const notificationSchema = new mongoose.Schema({
    recipient :{
        type:mongoose.Schema.Types.ObjectId,
        required : true,
        ref: "User"
    },
    body:{
        type:String,
        required:true
    },
    refModel:{
        type: String,
         enum: ["Order", "Item", "User"],
        required : true,
    },
    refId:{
      type:mongoose.Schema.Types.ObjectId,
    },
    type:{
        type: String,
        enum : ["new_Item","new_User"],
        required:true
    },
    title:{
        type:String,
        trim:true,
        required:true,
    },
    isRead:{
        type:Boolean,
        default:false
    }
},  { timestamps: true }
)
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model("Notification",notificationSchema)
export default Notification
