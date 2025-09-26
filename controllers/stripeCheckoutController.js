import Stripe from "stripe";
import { Payment } from "../models/paymentModel.js";
import { User } from "../models/userModel.js";
import { Order } from "../models/orderModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
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

    // Ensure required user fields
    if (!user.customerName || !user.phoneNumber || !user.email) {
      return res.status(400).json({
        success: false,
        message: "User must have customerName, phoneNumber, and email",
      });
    }

    // Validate CLIENT_URL
    if (!process.env.CLIENT_URL || !/^https?:\/\//.test(process.env.CLIENT_URL)) {
      return res.status(500).json({
        success: false,
        message: "Invalid CLIENT_URL in environment variables. Must include http:// or https://",
      });
    }

    // Map order items → Stripe line items
    const lineItems = order.orderItems.map((item) => {
      const productData = { name: item.productName };
      if (item.description) productData.description = item.description; // Only add description if exists

      return {
        price_data: {
          currency: order.currency || "usd",
          product_data: productData,
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Calculate total amount
    const totalAmount = order.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      customer_email: user.email,
      automatic_payment_methods: { enabled: true }, // supports all payment methods
      metadata: {
        userId: user._id.toString(),
        orderId: order._id.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout-cancel`,
    });

    // Save pending payment
    await Payment.create({
      customerDetails: {
        customerName: user.customerName  ,
        customerID: user._id,
        email: user.email ,
        phoneNumber: user.phoneNumber,
      },
      orderDetails: {
        orderID: order._id,
        transactionID: session.id,
        amount: totalAmount,
        currency: order.currency || "usd",
        paymentMethod: "Checkout (Automatic)",
        paymentStatus: "Pending",
        deliveryStatus: "Pending",
      },
      suspicious: false,
    });

    return res.status(200).json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Create CheckoutSession error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
