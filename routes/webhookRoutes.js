import express from 'express';
import { handleWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Stripe requires raw body here
router.post('/', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
