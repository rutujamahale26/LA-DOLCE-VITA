import express from 'express';
import upload from '../middleware/upload.js'
import { createProduct } from '../controllers/productController.js';
const router = express.Router()

router.post("/add-product", upload.array("images", 4), createProduct);

export default router
