import { Payment } from "../models/paymentModel.js";
import { User } from "../models/userModel.js";

export const createPayment = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneno,
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
    if (!name || !email || !phoneno) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and phone number are required",
      });
    }

    // 1️⃣ Find or create user
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      user = new User({
        name: name.trim(),
        email: email.toLowerCase(),
        phoneno: phoneno.trim(),
      });
      await user.save();
      isNewUser = true;
    }

    // 2️⃣ Prepare payment data
    const customerDetails = {
      name: user.name,
      customerID: user._id, // ✅ use User._id as reference
      email: user.email,
      phoneno: user.phoneno,
    };

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
    console.error("Error in createPayment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
