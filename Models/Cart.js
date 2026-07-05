import mongoose from "mongoose"

const cartSchema = new mongoose.Schema({
    userId :{
        type : mongoose.Schema.Types.ObjectId,
        required: false ,
        ref : "User"
    },
    items : [
      {
        itemId :{
            type: mongoose.Schema.Types.ObjectId,
            required :true,
            ref :"Item"
        },
        quantity:{
            type: Number,
            min:1,
            required:true
        }
      }  
    ]
        
}, { timestamps: true })

const Cart = mongoose.model("Cart" , cartSchema)
export default Cart