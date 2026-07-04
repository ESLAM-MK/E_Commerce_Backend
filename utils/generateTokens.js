import jwt from "jsonwebtoken"
const isProduction = process.env.NODE_ENV !=="development"
export const generateToken = (res,userId) =>{
    const payLoad = {userId:userId}
    const token = jwt.sign(payLoad,process.env.JWT_SECRET_KEY,{expiresIn:"2d"})
    res.cookie("jwt",token,{
        httpOnly:true,
        secure : isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge : 2 * 24 * 60 * 60 * 1000
    })
    return token;
}
export const generateRefreshToken =(res,userId)=>{
 const payLoad = {userId:userId}
    const refreshToken = jwt.sign(payLoad,process.env.JWT_SECRET_KEY,{expiresIn:"7d"})
    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure : isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge : 7 * 24 * 60 * 60 * 1000
    })
    return refreshToken;
}