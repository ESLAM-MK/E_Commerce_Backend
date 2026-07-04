import { text } from "express";
import mongoose from "mongoose";
const itemSchema = new mongoose.Schema({
    employee:{ type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true},
    title:{
        type:String,
        required:[true , "title is required"],
        trim: true
    },
    rate:{
        type : Number,
        default:0
    },
        description: { type: String },

    category: {
      type: String,
      required: true,
      enum: {values:[
        "camera",
        "dish",
        "sound",
        "smart home",
        "laptops",
        "other",
      ],}
    },
        images: [{ type: String }],
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        views: { type: Number, default: 0 },



},  { timestamps: true }
)
itemSchema.index({title:"text",description:"text"})
const Item = mongoose.model("Item", itemSchema)
export default Item