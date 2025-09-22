import express from 'express';
import upload from '../middleware/upload.js'
import { createProduct, deleteProduct, getProducts, updateProduct } from '../controllers/productController.js';
const router = express.Router();

router.post("/add-product", upload.array("images", 5), createProduct);
router.get('/product-list', getProducts);
router.put('/update-product/:id', updateProduct)
router.delete('/delete-product/:id', deleteProduct);

export default router;