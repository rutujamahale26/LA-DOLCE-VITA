import { User } from "../models/userModel.js";
import {Order} from '../models/orderModel.js';
import {Payment} from '../models/paymentModel.js'
import mongoose  from "mongoose";
// create new customer
export const createUser = async (req, res) => {
  try {
    const { customerName, email, phoneNumber, dob, address, isActive, communicationMethod, password } = req.body;

    // Check if email or phone already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      let conflictField = existingUser.email === email ? "email" : "phoneNumber";
      return res.status(400).json({
        success: false,
        message: `${conflictField} already exists`,
        field: conflictField
      });
    }

    // Create new user
    const user = new User({
      customerName,
      email,
      phoneNumber,
      dob,
      password, // ⚠️ you may want to hash this before saving
      address,
      isActive: isActive !== undefined ? isActive : true,
      communicationMethod: communicationMethod || "email"
    });

    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: savedUser,
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// delete user by id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
      deletedUser,
    });
  } catch (error) {
    console.error("Error deleting customer:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ✅ Update user by ID
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    // 🔎 Fetch existing user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Merge updates into existing nested objects
    if (updates.address) {
      Object.assign(user.address, updates.address);
    }
    if (updates.customerName) user.customerName = updates.customerName;
    if (updates.email) user.email = updates.email;
    if (updates.phoneNumber) user.phoneNumber = updates.phoneNumber;
    if (updates.dob) user.dob = updates.dob;
    if (updates.password) user.password = updates.password; // ⚠️ Hash if needed
    if (updates.isActive !== undefined) user.isActive = updates.isActive;
    if (updates.communicationMethod) user.communicationMethod = updates.communicationMethod;

    // ✅ Save with validation
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // find user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// get user details with user order history
export const getUserDetailsWithOrders = async (req, res) => {
  try {
    const {userId } = req.params;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const orders = await Order.find({ userId })
      .populate("userId")
      .populate("orderItems.productId")
      .lean();

    const ordersWithPayments = await Promise.all(
      orders.map(async (order) => {
        const payment = await Payment.findOne({
          "orderDetails.orderID": order._id,
        }).lean();

        return {
          ...order,
          payment: payment
            ? {
                status: payment.orderDetails.paymentStatus,
                deliveryStatus: payment.orderDetails.deliveryStatus,
                transactionID: payment.orderDetails.transactionID,
                method: payment.orderDetails.paymentMethod,
                amount: payment.orderDetails.amount,
              }
            : {
                status: "Pending",
                deliveryStatus: "Pending",
              },
        };
      })
    );

    const totalOrders = orders.length;
    const totalSpend = orders.reduce((acc, order) => acc + order.orderTotal, 0);
    const avgOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;

    const response = {
      customerProfile: {
        name: user.customerName,
        email: user.email,
        status: user.isActive ? "Active" : "Inactive",
        customerID: user._id,
        avgOrderValue: avgOrderValue.toFixed(2),
        totalSpend: totalSpend.toFixed(2),
        totalOrders,
        preferences: {
          emailMarketing: user.communicationMethod === "email",
          smsMarketing: user.communicationMethod === "sms",
        },
        dateJoined: user.createdAt,
        lastLogin: user.updatedAt,
      },
      orderHistory: ordersWithPayments,
    };

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Address in user detail page
export const updateCustomerAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { street, city, state, zipcode, country } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { address: { street, city, state, zipcode, country } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: user.address,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// block the customer or not in user detail page
export const toggleBlockCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { block } = req.body; // true = block, false = unblock

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: !block }, // if block=true → isActive=false
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: block ? "Customer blocked successfully" : "Customer unblocked successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search User by email | phoneNumber | id | search param
export const searchUser = async (req, res) => {
  try {
    const { email, phoneNumber, id } = req.query;

    // If no search parameter is provided
    if (!email && !phoneNumber && !id) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, phoneNumber, or id to search",
      });
    }

    let query = {};
    let searchType = "";

    if (email) {
      query = { email: email.toLowerCase() };
      searchType = "email";
    } else if (phoneNumber) {
      query = { phoneNumber };
      searchType = "phoneNumber";
    } else if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "⚠️ Invalid ID format",
        });
      }
      query = { _id: id };
      searchType = "id";
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          searchType === "email"
            ? " User not found by email"
            : searchType === "phoneNumber"
            ? " User not found by phone number"
            : " User not found by ID",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error searching user:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};



