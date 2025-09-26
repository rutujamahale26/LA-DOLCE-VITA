import express from 'express';
import { cancelOrder, createOrder, deleteOrder, getOrderById, getOrders, updateOrder } from '../controllers/orderController.js';


const router = express.Router();

router.post('/create-order', createOrder);
router.get('/order-list', getOrders);
router.delete('/delete-order/:id', deleteOrder)
router.get("/order-details/:id", getOrderById);
router.put('/update-order/:id', updateOrder)

// ✅ Cancel order for user detail page
router.put("/cancel-order/:orderId", cancelOrder);

export default router