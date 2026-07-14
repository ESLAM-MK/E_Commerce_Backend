import express from "express"
import { adminRegister, buyerRegister, employeeRegister, refreshToken, userLogin, userLogout } from "../controllers/authController.js"
import { generateRefreshToken } from "../utils/generateTokens.js"
const router = express.Router()
router.post("/buyer-register",buyerRegister)
router.post("/employee-register",employeeRegister)
router.post("/admin-register",adminRegister)
router.post("/login",userLogin)
router.post("/logout",userLogout)
router.post("/refresh-Token",refreshToken)
export default router