import express from 'express';
import { confirmPayment, createPaymentIntent, getStripePayment } from '../controllers/stripePaymentController.js';

const router = express.Router();

router.post('/create-intent', createPaymentIntent);
router.get('/check-payment/:intentId', getStripePayment);
router.post('/confirm-payment/:intentId', confirmPayment)

export default router;
