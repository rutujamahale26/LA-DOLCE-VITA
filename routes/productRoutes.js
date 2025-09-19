import express from 'express';
import upload from '../middleware/upload.js'
import { createProduct, getProducts } from '../controllers/productController.js';
const router = express.Router();

router.post("/add-product", upload.array("images", 5), createProduct);
router.get('/product-list', getProducts);

export default router;