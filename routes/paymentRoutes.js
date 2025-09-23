import express from 'express';
import { createPayment, deletePayment, getPayments, updatePayment } from '../controllers/paymentController.js';


const router = express.Router();

router.post('/create-payment', createPayment)
router.get('/payment-list',getPayments)
router.delete('/delete-payment/:id', deletePayment)
router.put('/update-payment/:id', updatePayment)

export default router