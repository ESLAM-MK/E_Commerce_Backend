import express from "express"
import { employeeOnly } from "../middlewares/authMiddleware.js"
import { addItem, deleteItem, getAllItems, getItem, updateItem } from "../controllers/itemController.js"
import uploadCloud from "../config/cloudinaryConfig.js"
const router = express.Router()
router.get('/:id',getItem)
router.get('/',getAllItems)
router.post('/',employeeOnly,uploadCloud.array("images",4) ,addItem)
router.put('/:id',employeeOnly,uploadCloud.array("images",4) ,updateItem)
router.delete('/:id',employeeOnly ,deleteItem)

export default router