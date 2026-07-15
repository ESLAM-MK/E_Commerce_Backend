import User from "../Models/user.js"
import jwt from "jsonwebtoken"
import { generateRefreshToken, generateToken } from "../utils/generateTokens.js"
import { sendEmail } from "../services/mailServices.js"
const isProduction =process.env.NODE_ENV !== "development"
export const refreshToken = async (req , res )=>{
try {
    const oldToken = req.cookies.refreshToken
    if(!oldToken){
        return res.status(401).json({success: false, message: "no refresh token"})
    }
    const decode = jwt.verify(oldToken,process.env.JWT_SECRET_KEY)
    const user = await User.findById(decode.userId)
    if(! user || user.refreshToken !== oldToken){
        return res.status(401).json({success: false, message: "invalid refresh token"})
    }
    generateToken(res , user._id)
    const newRefreshToken  =  generateRefreshToken(res, user._id)
    user.refreshToken = newRefreshToken
    await user.save()
     return res.status(200).json({success: true, data: null})
} catch (error) {
         return res.status(500).json({success: false, message : error.message})
}
}
export const buyerRegister = async (req,res)=>{
    try {
        const {name,phone,email,password} =req.body
        const existUser =await User.findOne({email})
        if(!name ||! phone || !email || !password){
          return res.status(400).json({success:false , message:"all fields are required"})
        }
        if(existUser){
            return res.status(400).json({success:false , message:"user already exist"})
        }
       const user= await User.create({role:"buyer",name,phone,email,password})
        const token = generateToken(res, user._id);
        const refreshTokenValue = generateRefreshToken(res, user._id);
        user.refreshToken = refreshTokenValue;
        await user.save()
         return res.status(201).json({success:true , message:"registered successfully",user:{name:name,email:email,phone:phone}})
    } catch (error) {
        return res.status(500).json({success:false , message:error.message})
    }
}
export const employeeRegister = async (req,res)=>{
    try {
        const {name,phone,email,password} =req.body
        const existUser =await User.findOne({email})
        if(!name ||! phone || !email || !password){
          return res.status(400).json({success:false , message:"all fields are required"})
        }
        if(existUser){
            return res.status(400).json({success:false , message:"user already exist"})
        }
       const user= await User.create({role:"employee",name,phone,email,password})
        const token = generateToken(res, user._id);
        const refreshTokenValue = generateRefreshToken(res, user._id);
        user.refreshToken = refreshTokenValue;
        await user.save()
         return res.status(201).json({success:true , message:"registered successfully",user:{name:name,email:email,phone:phone}})
    } catch (error) {
        return res.status(500).json({success:false , message:error.message})
    }
}
export const adminRegister = async (req,res)=>{
    try {
        const {name,phone,email,password} =req.body
        const existUser =await User.findOne({email})
        if(!name ||! phone || !email || !password){
          return res.status(400).json({success:false , message:"all fields are required"})
        }
        if(existUser){
            return res.status(400).json({success:false , message:"user already exist"})
        }
       const user= await User.create({role:"admin",name,phone,email,password})
        const token = generateToken(res, user._id);
        const refreshTokenValue = generateRefreshToken(res, user._id);
        user.refreshToken = refreshTokenValue;
        await user.save()
         return res.status(201).json({success:true , message:"registered successfully",user:{name:name,email:email,phone:phone}})
    } catch (error) {
        return res.status(500).json({success:false , message:error.message})
    }
}
export const userLogin = async (req , res)=>{
    try{
        const {email,name,password} = req.body
        const user = await User.findOne({email})
        if(! user || !(await user.matchPassword(password))){
           return res.status(401).json({success : false , message: "invalid credentials"})
        }
        const token = generateToken(res , user._id)
        const refreshToken = generateRefreshToken(res, user._id)
        user.refreshToken = refreshToken
        await user.save()
          return res.status(200).json({success : true , message: "Logged in successfully", user: { id: user._id, name: user.name, email: user.email }})
    }catch(error){
          return res.status(404).json({success : false , message: error.message})
    }
}
export const userLogout = async (req,res)=>{
    try {
        const refreshToken = req.cookies.refreshToken
        if(refreshToken){
            await User.findOneAndUpdate({refreshToken},{refreshToken:""})
        }
        const cookieOptions ={
            httpOnly:true,
            secure:isProduction,
            sameSite:isProduction ? "none" : "lax",
        }
        res.clearCookie("jwt",cookieOptions)
        res.clearCookie("refreshToken",cookieOptions)
        res.status(200).json({ success: true, data: null, message: "Logged out successfully" });
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
}
export const forgetPassword =async(req, res)=>{
    try {
        const {email} = req.body 
        const user = await User.findOne({email})
        if(!user){
             return res.status(404).json({success : false , message: "User Not Found"})
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        user.resetOTP = otp
        user.resetOTPExpire = Date.now() + 10 * 60 * 1000 // 10 minutes
        await user.save()
        await sendEmail({ to: user.email, subject: "Password Reset OTP", otp})
        return res.status(200).json({success : true , message: "OTP sent Successfully" ,data: null})
    } catch (error) {
             res.status(500).json({ success: false, message: error.message });
    }
}

export const resetPassword =async(req, res)=>{
    try {
        const {email ,otp ,newPassword } = req.body 
        const user = await User.findOne({email})
        if(!user){
             return res.status(404).json({ success: false, message: "User not found" });
        }
        const isOtpValid = user.resetOTP && user.resetOTP === String(otp).trim()
        const isNotExpired = user.resetOTPExpire && user.resetOTPExpire > Date.now()
        if(!isOtpValid || !isNotExpired){
                 return res.status(404).json({ success: false, message: "Invalid or Expired OTP" });
        }
        user.password = newPassword
        user.resetOTP =undefined
        user.resetOTPExpire = undefined
        await user.save()
        return res.status(200).json({success : true , message: "Password reset successfully", data: null})
    } catch (error) {
             res.status(500).json({ success: false, message: error.message });
    }
}