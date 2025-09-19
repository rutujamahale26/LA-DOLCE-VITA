import express from 'express';
import { createPayment, getPayments } from '../controllers/paymentController.js';


const router = express.Router();

router.post('/create-payment', createPayment)
router.get('payment-list',getPayments)
export default router