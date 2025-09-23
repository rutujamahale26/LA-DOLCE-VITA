import { Order } from "../models/orderModel.js";

// Create new order
export const createOrder = async (req, res) => {
  try {
    // console.log("Raw body:", req.body); 

    const {
      customerName,         // ✅ fixed (was customerName)
      email,
      phoneNumber,
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
      customerName,          // ✅ fixed
      email,
      phoneNumber,
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
