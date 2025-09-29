import { Cart } from "../models/addToCartProductModel.js";
import { Order } from "../models/orderModel.js";
import {Payment} from '../models/paymentModel.js';

// Create new order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethod, shippingMethod } = req.body;

    // 1️⃣ Get cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    // 2️⃣ Validate stock and update products
    for (let item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (item.quantity > product.stock) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${product.stock} items available for ${product.productName}` 
        });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // 3️⃣ Create order from cart
    const orderItems = cart.items.map(i => ({
      product: i.product._id,
      productName: i.product.productName,
      price: i.product.price,
      quantity: i.quantity,
      total: i.quantity * i.product.price
    }));

    const orderTotal = orderItems.reduce((sum, i) => sum + i.total, 0);

    const newOrder = new Order({
      user: userId,
      orderItems,
      orderTotal,
      paymentMethod,
      paymentStatus: "Pending",
      shippingMethod,
      shippingStatus: "Pending",
    });

    const savedOrder = await newOrder.save();

    // 4️⃣ Clear cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: savedOrder
    });
  } catch (error) {
    console.error("Create order error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// order listing / get all orders in db
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// delete order by id
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      deletedOrder,
    });
  } catch (error) {
    console.error("Error deleting order:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// // ✅ Update order by ID
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    // 🔎 Fetch existing order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ✅ Merge updates into order
    if (updates.customerName) order.customerName = updates.customerName;
    if (updates.email) order.email = updates.email;
    if (updates.phoneNumber) order.phoneNumber = updates.phoneNumber;
    if (updates.address) order.address = updates.address;

    // Handle order items update (recalculate totals)
    if (updates.orderItems && updates.orderItems.length > 0) {
      order.orderItems = updates.orderItems.map((item) => ({
        ...item,
        total: item.price * item.quantity,
      }));
      order.orderTotal = order.orderItems.reduce((sum, item) => sum + item.total, 0);
    }

    if (updates.paymentMethod) order.paymentMethod = updates.paymentMethod;
    if (updates.paymentStatus) order.paymentStatus = updates.paymentStatus;

    if (updates.shippingMethod) order.shippingMethod = updates.shippingMethod;
    if (updates.shippingStatus) order.shippingStatus = updates.shippingStatus;

    // ✅ Save with validation
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find order by ID
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// for cancel order  button in user details page 
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order first
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "❌ Order not found",
      });
    }

    // Prevent duplicate cancellation
    if (order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "⚠️ Order is already cancelled",
      });
    }

    // ✅ Update order with cancel info
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: "Cancelled",        // main order status
          shippingStatus: "Cancelled", // cancel shipping too
          paymentStatus: "Failed"      // mark payment as failed
        }
      },
      { new: true }
    );

    // ✅ Update related payment if exists
    await Payment.findOneAndUpdate(
      { "orderDetails.orderID": orderId },
      {
        $set: {
          "orderDetails.deliveryStatus": "Cancelled",
          "orderDetails.paymentStatus": "Failed"
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "✅ Order cancelled successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Cancel Order Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// create a manually orders with user id



