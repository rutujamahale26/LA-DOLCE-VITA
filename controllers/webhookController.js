import Stripe from 'stripe';
import { Payment } from '../models/paymentModel.js';
import { Order } from '../models/orderModel.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const obj = event.data.object;

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const payment = await Payment.findOne({ 'orderDetails.transactionID': obj.id });
        if (!payment) break;

        const order = await Order.findById(obj.metadata.orderId);
        const expectedAmount = order.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100;

        if (obj.amount_received !== expectedAmount) {
          await Payment.findByIdAndUpdate(payment._id, {
            'orderDetails.paymentStatus': 'Failed',
            suspicious: true,
          });
          break;
        }

        await Payment.findByIdAndUpdate(payment._id, { 'orderDetails.paymentStatus': 'Paid', suspicious: false });
        await Order.findByIdAndUpdate(order._id, { paymentStatus: 'Paid' });
        break;
      }

      case 'payment_intent.payment_failed': {
        await Payment.findOneAndUpdate({ 'orderDetails.transactionID': obj.id }, { 'orderDetails.paymentStatus': 'Failed' });
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).send('Webhook processing error');
  }
};




