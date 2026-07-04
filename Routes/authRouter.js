import express from "express"
import { adminRegister, buyerRegister, employeeRegister, userLogin, userLogout } from "../controllers/authController.js"
const router = express.Router()
router.post("/buyer-register",buyerRegister)
router.post("/employee-register",employeeRegister)
router.post("/admin-register",adminRegister)
router.post("/login",userLogin)
router.post("/logout",userLogout)
export default router