import express from 'express';
import { addToCart, getCart, removeFromCart, updateQuantity } from '../controllers/addToCartProductController.js';
import { authMiddleware } from '../middleware/web_authMiddleware.js';

const router = express.Router();

router.post('/add', authMiddleware ,addToCart)
router.get('/', authMiddleware, getCart)
router.put('/update', authMiddleware, updateQuantity);
router.delete('/remove', authMiddleware, removeFromCart)

export default router