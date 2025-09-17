import express from 'express';
import bodyParser from 'body-parser'
import fs from  'fs';
import path from 'path'
import {fileURLToPath} from 'url'

import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoute.js'
import productRoutes from './routes/productRoutes.js'


import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT= process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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


app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`)
})