import express from 'express';
import bodyParser from 'body-parser'
import fs from  'fs';
import path from 'path'
import {fileURLToPath} from 'url'

import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoute.js'
import productRoutes from './routes/productRoutes.js'
import tiktokEventRoutes from './routes/titokEventRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js'
import orderRoutes from './routes/OrderRoutes.js'
import authRoutes from './routes/web_authRoutes.js'



import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT= process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// DB Connection
connectDB()

//Static folder for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// default route
app.get('/', (req, res)=>{
    res.send('Hello from server')
})

// routes
app.use('/api/user', userRoutes)
app.use('/api/product', productRoutes)
app.use('/api/event', tiktokEventRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/auth', authRoutes)



app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`)
})