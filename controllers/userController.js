import { User } from "../models/userModel.js";

// create new customer
export const createUser = async (req, res) => {
  try {
    const { name, email, phoneno, dob, address, isActive,communicationMethod } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ $or:[{email}, {phoneno}] });
    if (existingUser) {
      let conflictField = existingUser.email === email ? "email" : "phoneno";
      return res.status(400).json({
        success: false,
        message: `${conflictField} already exists`,
        field: conflictField
      });
    }

    // Create new user
    const user = new User({
      user : user._id,
      name,
      email,
      phoneno,
      dob,
      address,
      isActive : isActive !== undefined ? isActive : true,
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