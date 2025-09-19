import express from 'express';
import { createOrder, getOrders } from '../controllers/orderController.js';



const router = express.Router();

router.post('/create-order', createOrder)
router.get('/order-list', getOrders)

export default router