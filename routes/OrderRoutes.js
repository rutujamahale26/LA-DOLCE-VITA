import express from 'express';
import { createOrder, deleteOrder, getOrders, updateOrder } from '../controllers/orderController.js';


const router = express.Router();

router.post('/create-order', createOrder);
router.get('/order-list', getOrders);
router.delete('/delete-order/:id', deleteOrder)
router.put('/update-order/:id', updateOrder)

export default router