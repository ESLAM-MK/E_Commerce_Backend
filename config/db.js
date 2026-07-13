import mongoose from "mongoose";
 const connectDb = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("DB connected successfully");
    } catch (error) {
         console.log("connection failed",error.message);
    }
 }
 export default connectDb;