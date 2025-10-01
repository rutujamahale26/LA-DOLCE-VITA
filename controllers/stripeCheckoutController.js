// controllers/stripeController.js
import Stripe from "stripe";
import { Order } from "../models/orderModel.js";
import { User } from "../models/userModel.js";
import { Product } from "../models/productModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Checkout Controller
export const createCheckout = async (req, res) => {
  try {
    const { userId, items, paymentMethod, shippingMethod } = req.body;

    // 1️⃣ Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2️⃣ Fetch products & calculate total
    let orderItems = [];
    let orderTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: ` Product not available: ${item.productId}` });
      }

      const total = product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        productName: product.productName,
        quantity: item.quantity,
        price: product.price,
        total,
      });

      orderTotal += total;
    }

    // 3️⃣ Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(orderTotal * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: user._id.toString(),
      },
    });

    // 4️⃣ Save Order in DB
    const order = await Order.create({
      userId: user._id,
      customerName: user.customerName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: `${user.address.street}, ${user.address.city}, ${user.address.state}, ${user.address.zipcode}, ${user.address.country}`,
      orderItems,
      paymentMethod,
      paymentStatus: "Pending",
      shippingMethod,
      shippingStatus: "Pending",
      orderTotal,
    });

    res.status(200).json({
      success: true,
      message:"Create payment intent successfully",
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      amount: orderTotal,
      currency: "usd",
    });
  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Stripe Webhook Controller
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(" Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {

      // ===== PaymentIntent succeeded =====
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata.userId;

        const order = await Order.findOneAndUpdate(
          { userId, paymentStatus: "Pending" },
          { paymentStatus: "Paid" },
          { new: true }
        );

        if (order) {
          // Deduct stock
          for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { stock: -item.quantity },
            });
          }
          console.log(`Order ${order._id} marked Paid, stock updated.`);
        } else {
          console.log(`No pending order found for user ${userId}`);
        }
        break;
      }

      // ===== PaymentIntent failed =====
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata.userId;

        const order = await Order.findOneAndUpdate(
          { userId, paymentStatus: "Pending" },
          { paymentStatus: "Failed" },
          { new: true }
        );

        console.log(
          order
            ? ` Payment failed for order ${order._id}`
            : ` No pending order found for user ${userId}`
        );
        break;
      }

      // ===== PaymentIntent canceled =====
      case "payment_intent.canceled": {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata.userId;

        const order = await Order.findOneAndUpdate(
          { userId, paymentStatus: "Pending" },
          { paymentStatus: "Canceled" },
          { new: true }
        );

        console.log(
          order
            ? ` Payment canceled for order ${order._id}`
            : `No pending order found for user ${userId}`
        );
        break;
      }

      // ===== Checkout Session completed =====
      case "checkout.session.completed": {
        const session = event.data.object;

        // You can access metadata set during session creation
        const userId = session.metadata.userId;

        // Optional: Find order by metadata or payment_intent ID
        const order = await Order.findOneAndUpdate(
          { userId, paymentStatus: "Pending" },
          { paymentStatus: "Paid" },
          { new: true }
        );

        if (order) {
          for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { stock: -item.quantity },
            });
          }
          console.log(
            `✅ Checkout session completed. Order ${order._id} marked Paid, stock updated.`
          );
        } else {
          console.log(` No pending order found for user ${userId}`);
        }
        break;
      }

      // ===== Catch all other events =====
      default:
        console.log(`ℹ️ Unhandled event type received: ${event.type}`);
    }

    // Respond to Stripe
    res.json({ received: true });

  } catch (err) {
    console.error(" Webhook processing error:", err);
    res.status(500).send("Webhook Error");
  }
};

