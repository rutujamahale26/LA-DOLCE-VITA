import { Payment } from "../models/paymentModel.js";
import { User } from "../models/userModel.js";

// create new payment
export const createPayment = async (req, res) => {
  try {
    const {
      customerName,
      email,
      phoneNumber,
      orderID,
      transactionID,
      amount,
      paymentMethod,
      paymentStatus,
      deliveryStatus,
      date,
      notes,
    } = req.body;

    // ✅ Basic validation
    if (!customerName || !email || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "customerName, email, and phoneNumber are required",
      });
    }

    // 1️⃣ Find or create user
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      user = new User({
        customerName: customerName.trim(),
        email: email.toLowerCase(),
        phoneNumber: phoneNumber.trim(),
      });
      await user.save();
      isNewUser = true;
    }

    // 2️⃣ Prepare customerDetails (MUST match schema exactly)
    const customerDetails = {
      customerName: user.customerName,  // ✅ matches schema
      customerID: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,    // ✅ matches schema
    };

    // Debug log
    // console.log("📌 CustomerDetails to save:", customerDetails);

    const orderDetails = {
      orderID,
      transactionID,
      amount,
      paymentMethod,
      paymentStatus: paymentStatus || "Pending",
      deliveryStatus: deliveryStatus || "Pending",
      date: date || Date.now(),
      notes,
    };

    // 3️⃣ Save payment
    const payment = new Payment({
      customerDetails,
      orderDetails,
    });

    await payment.save();

    // 4️⃣ Response
    return res.status(201).json({
      success: true,
      message: isNewUser
        ? "New user created successfully and payment recorded"
        : "User exists, payment recorded successfully",
      isNewUser,
      customerDetails,
      orderDetails,
      paymentID: payment._id,
      createdAt: payment.createdAt,
    });
  } catch (error) {
    console.error("❌ Error in createPayment:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all payments
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPayment = await Payment.findByIdAndDelete(id);

    if (!deletedPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
      deletedPayment,
    });
  } catch (error) {
    console.error("Error deleting payment:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Update Payment
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;   // Payment document ID
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    // 🔎 Fetch existing payment
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // ✅ Merge updates into existing nested objects
    if (updates.customerDetails) {
      Object.assign(payment.customerDetails, updates.customerDetails);
    }
    if (updates.orderDetails) {
      Object.assign(payment.orderDetails, updates.orderDetails);
    }

    // ✅ Save with validation
    const updatedPayment = await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: {
        paymentId: updatedPayment._id,   // 👈 renamed for clarity
        customerDetails: updatedPayment.customerDetails,
        orderDetails: updatedPayment.orderDetails,
        createdAt: updatedPayment.createdAt,
        updatedAt: updatedPayment.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error updating payment:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
