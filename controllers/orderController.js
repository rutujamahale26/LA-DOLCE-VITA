import { Order } from "../models/orderModel.js";

// Create new order
export const createOrder = async (req, res) => {
  try {
    console.log("Raw body:", req.body); 

    const {
      name,         // ✅ fixed (was customerName)
      email,
      phoneno,
      address,
      orderItems,
      paymentMethod,
      paymentStatus,
      shippingMethod,
      shippingStatus,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    // calculate totals
    const calculatedItems = orderItems.map((item) => ({
      ...item,
      total: item.price * item.quantity,
    }));

    const orderTotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);

    const newOrder = new Order({
      name,          // ✅ fixed
      email,
      phoneno,
      address,
      orderItems: calculatedItems,
      paymentMethod,
      paymentStatus: paymentStatus || "Pending",
      shippingMethod,
      shippingStatus: shippingStatus || "Pending",
      orderTotal,
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      savedOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
