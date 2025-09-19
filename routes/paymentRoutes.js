import express from 'express';
import { createPayment, deletePayment, getPayments } from '../controllers/paymentController.js';


const router = express.Router();

router.post('/create-payment', createPayment)
router.get('/payment-list',getPayments)
router.delete('/delete-payment/:id', deletePayment)

export default router