import jwt from "jsonwebtoken"
import User from "../Models/User.js"
export const protect = async (req , res, next)=>{
   try {
       const token = req.cookies.jwt 
        if(! token){
            return res.status(401).json({success:false , message:"not authorized user"})
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findById(decode.userId).select("-password")
        if(!user){
           return res.status(401).json({success:false , message:"user does not exist"})
        }
        req.user = user
        next();
   } catch (error) {
        return res.status(401).json({success:false , message:"no token"})
   } 
}
export const employeeOnly =async (req , res ,next)=>{
    try {
        // console.log("Cookies received:", req.cookies);
        if(req.user.role !=="employee"){
         return res.status(403).json({success:false , message:"employee only"})
        }
        next()
    } catch (error) {
        return res.status(500).json({success:false , message:error.message})
    }
}
export const adminOnly =async (req , res ,next)=>{
    try {
        if(req.user.role !=="admin"){
         return res.status(403).json({success:false , message:"admin only"})
        }
        next()
    } catch (error) {
        return res.status(500).json({success:false , message:error.message})
    }
}
export const buyerOnly =async (req , res ,next)=>{
    try {
        if(req.user.role !=="buyer"){
         return res.status(403).json({success:false , message:"buyer only"})
        }
        next()
    } catch (error) {
        return res.status(500).json({success:false , message:error.message})
    }
}