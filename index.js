import express from 'express';
import bodyParser from 'body-parser'
import fs from  'fs';
import path from 'path'
import {fileURLToPath} from 'url'
import cors from 'cors'

// import routes
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoute.js'
import productRoutes from './routes/productRoutes.js'
import tiktokEventRoutes from './routes/titokEventRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js'
import orderRoutes from './routes/OrderRoutes.js'
import authRoutes from './routes/web_authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import stripePaymentRoutes from './routes/stripePaymentRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js'
import stripeCheckoutRoutes from './routes/stripeCheckoutRoutes.js'
import cartRoutes from './routes/cartRoutes.js'

import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT= process.env.PORT || 4000;

const allowedOrigins = [
    'http://localhost:5173',
    'https://silly-blancmange-c43ff5.netlify.app'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));


// Webhook FIRST (raw body required)
app.use('/api/webhook', webhookRoutes);

// middleware
app.use(express.json());
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));


const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// DB Connection
connectDB()



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
app.use('/api/admin', adminRoutes)
app.use('/api/stripe', stripePaymentRoutes)
app.use('/api/stripe/checkout', stripeCheckoutRoutes)
app.use('/api/cart', cartRoutes)

app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`)
})