import express from "express"
import { deleteNotification, markAllAsRead, markAsRead, myNotifications } from "../controllers/notificationController.js"
const router = express.Router()
router.get('/' ,myNotifications)
router.patch('/:id/read' ,markAsRead)
router.patch('/read-all' ,markAllAsRead)
router.delete('/:id' ,deleteNotification)
