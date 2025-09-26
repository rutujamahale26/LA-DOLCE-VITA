import Stripe from 'stripe';
import { Payment } from '../models/paymentModel.js';
import { User } from '../models/userModel.js';
import { Order } from '../models/orderModel.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 👉 Create Stripe PaymentIntent
export const createPaymentIntent = async (req, res) => {
  try {
    const { userId, orderId } = req.body;

    if (!userId || !orderId) {
      return res.status(400).json({ success: false, message: "userId and orderId required" });
    }

    const user = await User.findById(userId);
    const order = await Order.findById(orderId);

    if (!user || !order) {
      return res.status(404).json({ success: false, message: "User or Order not found" });
    }

    const totalAmount = order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: order.currency || "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: user.email,
      metadata: {
        userId: user._id.toString(),
        orderId: order._id.toString(),
      },
    });

    await Payment.create({
      customerDetails: {
        customerName: user.customerName,
        customerID: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      orderDetails: {
        orderID: order._id,
        transactionID: paymentIntent.id,
        amount: totalAmount,
        currency: order.currency || "usd",
        paymentMethod: "automatic",
        paymentStatus: "Pending",
        deliveryStatus: "Pending",
      },
      suspicious: false,
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Create PaymentIntent error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 👉 Retrieve PaymentIntent from Stripe
export const getStripePayment = async (req, res) => {
  try {
    const { intentId } = req.params;

    if(!intentId){
      return res.status(400).json({
        status:false,
        message:'Payment intent id is required',
        statusCode : 400
      })
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(intentId);
    res.status(200).json({ 
      success: true, 
      message:"Check payment successfully",
      amount: paymentIntent.amount,
      paymentIntent 
    });
  } catch (error) {
    console.log('Check payment error', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

//👉 confirm payment
export const confirmPayment = async(req, res) =>{
  try{
    const { intentId } = req.params;

    if(!intentId){
      return res.status(400).json({
        status:false,
        message:'Payment intent id is required',
        statusCode : 400
      })
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(intentId)
    if(!paymentIntent.status !== "Suceeded"){
      return res.status(400).json({
        status: false,
        message: `Payment not suceeded: Current status:${paymentIntent.status}`
      });
    }

    return res.staus(200).json({
      message:'Payment verified successfully',
      payment:{
        id: intentId.id,
        amount: intentId.amount / 100,
        currency: intentId.currency
      }
    })
  }catch(error){
    console.log('Confirm payment error', error)
    return res.status(500).json({
      status:false,
      message:'Failed to confirm payment',
      error: error.message
    })
  }
}
