import mongoose from "mongoose"
const orderSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    items:[
        {
            itemId:{type:mongoose.Schema.Types.ObjectId , ref:"Item",required:true},
            quantity:{type:Number,required :true},
            priceAtPurchase:{type:Number , required:true}
        }
    ],
    totalPrice:{type:Number,required :true},
    paymentInfo:{
        paymobId:{type:String, default:null },
        paymentMethod: { type: String, enum: ['Card', 'Wallet', 'Fawry'], required: true },
        transactionId: { type: String, default: null }

    },
    paymentStatus:{
        type:String,
        enum:{values:["Paid" ,"Failed","Pending"],message:"payment status is not valid"},
         default:"Pending"

    },
     orderStatus:{
        type:String,
        enum:{values:["Placed" ,"Processing","Shipped","Delivered" ,"Cancelled"],message:"order status is not valid"},
        default:"Placed"
    },
    addressInfo:{
        city:{type:String, required:true},
        street:{type:String, required:true},
         phone: {
        type: String,
        match: [/^01[0125][0-9]{8}$/, "Invalid phone format"],
        required: [true, "invalid phone number"]
    },
    notes:{type:String}
    }
},{timestamps:true})
const Order = new mongoose.model("Order" ,orderSchema)
export default Order
