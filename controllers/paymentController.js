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
