import express from 'express';
import { createOrder, deleteOrder, getOrders } from '../controllers/orderController.js';



const router = express.Router();

router.post('/create-order', createOrder);
router.get('/order-list', getOrders);
router.delete('/delete-order/:id', deleteOrder)

export default router