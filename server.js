import express from "express"
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"; 
import cors from "cors"
import dotenv from "dotenv";
import authRoutes from "./Routes/authRouter.js"
import itemRoutes from "./Routes/itemsRouter.js"
import { protect } from "./middlewares/authMiddleware.js";
import {createServer} from "http"
import {Server} from "socket.io"
dotenv.config();
const app = express();
const httpServer = createServer(app)
const corsOptions = {
    origin: process.env.FRONT_URL,
    credentials: true,
}
export const io =new Server(httpServer , {
   corsOptions
})
io.on("connection",(socket)=>{
    console.log(`Socket connected: ${socket.id}`);
    socket.on("join_user_room",(userId)=>{
        socket.join(userId)
    })
    socket.on("disconnect",()=>{
        console.log(`disconnected ${socket.id}`)
    })
})
 
connectDb()
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads' ,express.static("uploads"))
app.use(cookieParser())
app.use((req,res,next)=>{
    req.io=io
    next()  
})
app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/item",protect, itemRoutes)

// not found path
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
// for global  error handler
app.use((error,req, res ,next)=>{
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode).json({success :false , message :error.message ,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    })
})
const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
// console.log("Checking Env:", process.env.CLOUD_NAME, process.env.CLOUDINARY_API_KEY);
export default app;
